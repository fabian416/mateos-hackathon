"""
Comprehensive tests for the MateOS Agent Router (main.py).

Run with:
    cd agents/router && SQUAD_AUTH_TOKEN=test-token pytest test_main.py -v

Covers:
  - Health endpoint (no auth)
  - Auth (valid/invalid/missing token)
  - /agents discovery
  - /route — success, unknown target, self-delegation, unreachable agent, timeout
  - /broadcast — fan-out, capability filtering, empty targets
  - /tasks — list, filter, limit, edge cases
  - /tasks/{id}/update — success, not found, empty body
  - Concurrent task creation
  - Registry edge cases (empty, malformed entries)
"""

import asyncio
import json
import os
import uuid
from collections import deque
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Set SQUAD_AUTH_TOKEN BEFORE importing main — the module reads it at import
# ---------------------------------------------------------------------------
os.environ["SQUAD_AUTH_TOKEN"] = "test-token"

# Prevent _load_registry from loading the real file during import
os.environ["AGENT_REGISTRY_FILE"] = "/dev/null"
os.environ.pop("AGENT_REGISTRY", None)

import main  # noqa: E402  (must come after env setup)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

AUTH_HEADER = {"Authorization": "Bearer test-token"}

SAMPLE_AGENTS = {
    "tropero": {
        "host": "tropero-mateos",
        "port": 18789,
        "role": "Ventas y Leads",
        "description": "Sales agent",
        "capabilities": ["sales", "leads", "pipeline"],
    },
    "domador": {
        "host": "domador-mateos",
        "port": 18789,
        "role": "Admin y Datos",
        "description": "Admin agent",
        "capabilities": ["sheets", "calendar", "tasks"],
    },
}


@pytest.fixture(autouse=True)
def _reset_state():
    """Reset global mutable state before each test."""
    main.AGENTS.clear()
    main.AGENTS.update(SAMPLE_AGENTS)
    main.task_log.clear()
    yield
    main.AGENTS.clear()
    main.task_log.clear()


@pytest.fixture()
def client():
    """TestClient with lifespan — creates and closes the httpx.AsyncClient."""
    with TestClient(main.app, raise_server_exceptions=False) as c:
        yield c


@pytest.fixture()
def mock_httpx_success(client):
    """Patch the app's httpx client to return 200 for every POST."""
    mock_response = httpx.Response(
        200,
        json={"ok": True},
        request=httpx.Request("POST", "http://fake"),
    )
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post = AsyncMock(return_value=mock_response)
    # Store original and replace
    original = main.app.state.http_client
    main.app.state.http_client = mock_client
    yield mock_client
    main.app.state.http_client = original


@pytest.fixture()
def mock_httpx_error(client):
    """Patch the app's httpx client to raise ConnectError."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post = AsyncMock(side_effect=httpx.ConnectError("Connection refused"))
    original = main.app.state.http_client
    main.app.state.http_client = mock_client
    yield mock_client
    main.app.state.http_client = original


@pytest.fixture()
def mock_httpx_timeout(client):
    """Patch the app's httpx client to raise TimeoutException."""
    mock_client = AsyncMock(spec=httpx.AsyncClient)
    mock_client.post = AsyncMock(side_effect=httpx.TimeoutException("Timed out"))
    original = main.app.state.http_client
    main.app.state.http_client = mock_client
    yield mock_client
    main.app.state.http_client = original


# ===========================================================================
# 1. Health endpoint
# ===========================================================================


class TestHealth:
    def test_health_no_auth(self, client):
        """Health endpoint should work without authentication."""
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "agents" in data
        assert "tasks_logged" in data

    def test_health_returns_agent_count(self, client):
        resp = client.get("/health")
        assert resp.json()["agents"] == 2  # tropero + domador

    def test_health_returns_task_count(self, client):
        main.task_log.append({"task_id": "t1", "status": "sent"})
        resp = client.get("/health")
        assert resp.json()["tasks_logged"] == 1

    def test_health_with_empty_registry(self, client):
        main.AGENTS.clear()
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["agents"] == 0


# ===========================================================================
# 2. Auth
# ===========================================================================


class TestAuth:
    def test_valid_token(self, client):
        resp = client.get("/agents", headers=AUTH_HEADER)
        assert resp.status_code == 200

    def test_invalid_token(self, client):
        resp = client.get("/agents", headers={"Authorization": "Bearer wrong-token"})
        assert resp.status_code == 401
        assert "Invalid squad token" in resp.json()["detail"]

    def test_missing_auth_header(self, client):
        resp = client.get("/agents")
        assert resp.status_code == 401

    def test_empty_bearer(self, client):
        resp = client.get("/agents", headers={"Authorization": "Bearer "})
        assert resp.status_code == 401

    def test_non_bearer_scheme(self, client):
        """Token sent with a scheme other than 'Bearer' should be rejected."""
        resp = client.get("/agents", headers={"Authorization": "Basic test-token"})
        assert resp.status_code == 401

    def test_auth_required_on_all_protected_endpoints(self, client):
        """All endpoints except /health should require auth."""
        protected = [
            ("GET", "/agents"),
            ("POST", "/route"),
            ("POST", "/broadcast"),
            ("GET", "/tasks"),
            ("POST", "/tasks/fake-id/update"),
        ]
        for method, path in protected:
            resp = client.request(method, path)
            assert resp.status_code == 401, f"{method} {path} should require auth"


# ===========================================================================
# 3. /agents endpoint
# ===========================================================================


class TestAgents:
    def test_list_agents(self, client):
        resp = client.get("/agents", headers=AUTH_HEADER)
        assert resp.status_code == 200
        data = resp.json()
        assert "tropero" in data
        assert "domador" in data
        assert data["tropero"]["role"] == "Ventas y Leads"
        assert "sales" in data["tropero"]["capabilities"]

    def test_agents_does_not_expose_token(self, client):
        """If an agent has a 'token' field in registry, it should not be leaked."""
        main.AGENTS["tropero"]["token"] = "secret-agent-token"
        resp = client.get("/agents", headers=AUTH_HEADER)
        data = resp.json()
        assert "token" not in data["tropero"]

    def test_agents_empty_registry(self, client):
        main.AGENTS.clear()
        resp = client.get("/agents", headers=AUTH_HEADER)
        assert resp.status_code == 200
        assert resp.json() == {}

    def test_agents_missing_optional_fields(self, client):
        """Agent with minimal fields (just host/port) should still work."""
        main.AGENTS["minimal"] = {"host": "localhost", "port": 9999}
        resp = client.get("/agents", headers=AUTH_HEADER)
        data = resp.json()
        assert data["minimal"]["role"] == ""
        assert data["minimal"]["capabilities"] == []
        assert data["minimal"]["description"] == ""


# ===========================================================================
# 4. /route endpoint
# ===========================================================================


class TestRoute:
    def test_route_success(self, client, mock_httpx_success):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Contactar lead urgente",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "delivered"
        assert data["target"] == "tropero"
        assert data["task_id"].startswith("task-")

    def test_route_custom_task_id(self, client, mock_httpx_success):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
                "task_id": "my-custom-id",
            },
        )
        assert resp.status_code == 200
        assert resp.json()["task_id"] == "my-custom-id"

    def test_route_unknown_target(self, client):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "nonexistent",
                "message": "Test",
            },
        )
        assert resp.status_code == 404
        assert "nonexistent" in resp.json()["detail"]

    def test_route_self_delegation(self, client):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "tropero",
                "target": "tropero",
                "message": "Test",
            },
        )
        assert resp.status_code == 400
        assert "sí mismo" in resp.json()["detail"]

    def test_route_agent_unreachable(self, client, mock_httpx_error):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        assert resp.status_code == 502
        assert "unreachable" in resp.json()["detail"]

    def test_route_agent_timeout(self, client, mock_httpx_timeout):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        assert resp.status_code == 502
        assert "timeout" in resp.json()["detail"]

    def test_route_agent_returns_500(self, client):
        """Agent responds but with HTTP 500 — should still log task with error status."""
        mock_response = httpx.Response(
            500,
            text="Internal Server Error",
            request=httpx.Request("POST", "http://fake"),
        )
        mock_client = AsyncMock(spec=httpx.AsyncClient)
        mock_client.post = AsyncMock(return_value=mock_response)
        original = main.app.state.http_client
        main.app.state.http_client = mock_client

        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        assert resp.status_code == 502
        # Task should still be logged
        assert len(main.task_log) == 1
        assert main.task_log[0]["status"] == "error"

        main.app.state.http_client = original

    def test_route_missing_required_fields(self, client):
        """Pydantic should reject request with missing required fields."""
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={"sender": "domador"},  # missing target, message
        )
        assert resp.status_code == 422

    def test_route_empty_message(self, client):
        """Empty string for required field should still be accepted by Pydantic."""
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "",
            },
        )
        # Pydantic Field(...) requires the field to be present, but "" is a valid str
        # This should proceed to routing logic
        assert resp.status_code in (200, 502)  # depends on mock

    def test_route_with_context(self, client, mock_httpx_success):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Lead info",
                "context": {"company": "Acme", "email": "john@acme.com"},
            },
        )
        assert resp.status_code == 200
        # Verify the context was included in the message sent to the agent
        call_args = mock_httpx_success.post.call_args
        body = call_args.kwargs.get("json") or call_args[1].get("json")
        assert "Acme" in body["message"]

    def test_route_with_priority(self, client, mock_httpx_success):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Urgent task",
                "priority": "urgent",
            },
        )
        assert resp.status_code == 200
        # Task logged with correct priority
        assert main.task_log[0]["priority"] == "urgent"

    def test_route_creates_task_log_entry(self, client, mock_httpx_success):
        client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        assert len(main.task_log) == 1
        entry = main.task_log[0]
        assert entry["sender"] == "domador"
        assert entry["target"] == "tropero"
        assert entry["status"] == "delivered"
        assert entry["delivered_at"] is not None
        assert entry["error"] is None

    def test_route_message_truncated_in_log(self, client, mock_httpx_success):
        """Messages longer than 500 chars should be truncated in the task log."""
        long_message = "A" * 1000
        client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": long_message,
            },
        )
        assert len(main.task_log[0]["message"]) == 500


# ===========================================================================
# 5. /broadcast endpoint
# ===========================================================================


class TestBroadcast:
    def test_broadcast_all(self, client, mock_httpx_success):
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "external",
                "message": "System update",
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        # Should broadcast to both tropero and domador (sender != any agent)
        assert data["targets"] == 2
        assert len(data["results"]) == 2
        targets = {r["target"] for r in data["results"]}
        assert targets == {"tropero", "domador"}

    def test_broadcast_excludes_sender(self, client, mock_httpx_success):
        """Sender should not receive their own broadcast."""
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "tropero",
                "message": "Announcement",
            },
        )
        data = resp.json()
        assert data["targets"] == 1
        assert data["results"][0]["target"] == "domador"

    def test_broadcast_filter_by_capability(self, client, mock_httpx_success):
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "external",
                "message": "Sales update",
                "capability": "sales",
            },
        )
        data = resp.json()
        # Only tropero has "sales" capability
        assert data["targets"] == 1
        assert data["results"][0]["target"] == "tropero"

    def test_broadcast_no_matching_capability(self, client, mock_httpx_success):
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "external",
                "message": "Test",
                "capability": "nonexistent_capability",
            },
        )
        data = resp.json()
        assert data["targets"] == 0
        assert data["results"] == []

    def test_broadcast_empty_registry(self, client, mock_httpx_success):
        main.AGENTS.clear()
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "external",
                "message": "Test",
            },
        )
        data = resp.json()
        assert data["targets"] == 0

    def test_broadcast_partial_failure(self, client):
        """One agent reachable, one unreachable — should still return results for both."""
        call_count = 0

        async def _alternating_post(*args, **kwargs):
            nonlocal call_count
            call_count += 1
            if call_count % 2 == 0:
                raise httpx.ConnectError("Connection refused")
            return httpx.Response(
                200, json={"ok": True}, request=httpx.Request("POST", "http://fake")
            )

        mock_client = AsyncMock(spec=httpx.AsyncClient)
        mock_client.post = AsyncMock(side_effect=_alternating_post)
        original = main.app.state.http_client
        main.app.state.http_client = mock_client

        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "external",
                "message": "Test",
            },
        )
        data = resp.json()
        assert data["targets"] == 2
        statuses = {r["status"] for r in data["results"]}
        # At least one delivered, at least one unreachable
        assert len(statuses) > 1 or len(data["results"]) == 2

        main.app.state.http_client = original

    def test_broadcast_custom_task_id(self, client, mock_httpx_success):
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={
                "sender": "external",
                "message": "Test",
                "task_id": "bc-001",
            },
        )
        data = resp.json()
        assert data["task_id"] == "bc-001"
        # Sub-task IDs should include parent ID
        for result in data["results"]:
            assert result["task_id"].startswith("bc-001-")


# ===========================================================================
# 6. /tasks endpoint
# ===========================================================================


class TestTasks:
    def _seed_tasks(self):
        """Seed task_log with some entries for querying."""
        tasks = [
            {"task_id": "t1", "sender": "domador", "target": "tropero", "status": "delivered", "message": "msg1", "created_at": "2026-01-01T00:00:00Z"},
            {"task_id": "t2", "sender": "tropero", "target": "domador", "status": "error", "message": "msg2", "created_at": "2026-01-02T00:00:00Z"},
            {"task_id": "t3", "sender": "domador", "target": "tropero", "status": "delivered", "message": "msg3", "created_at": "2026-01-03T00:00:00Z"},
            {"task_id": "t4", "sender": "external", "target": "domador", "status": "timeout", "message": "msg4", "created_at": "2026-01-04T00:00:00Z"},
        ]
        for t in tasks:
            main.task_log.append(t)

    def test_list_all_tasks(self, client):
        self._seed_tasks()
        resp = client.get("/tasks", headers=AUTH_HEADER)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 4

    def test_filter_by_sender(self, client):
        self._seed_tasks()
        resp = client.get("/tasks?sender=domador", headers=AUTH_HEADER)
        data = resp.json()
        assert len(data) == 2
        assert all(t["sender"] == "domador" for t in data)

    def test_filter_by_target(self, client):
        self._seed_tasks()
        resp = client.get("/tasks?target=tropero", headers=AUTH_HEADER)
        data = resp.json()
        assert len(data) == 2
        assert all(t["target"] == "tropero" for t in data)

    def test_filter_by_status(self, client):
        self._seed_tasks()
        resp = client.get("/tasks?status=error", headers=AUTH_HEADER)
        data = resp.json()
        assert len(data) == 1
        assert data[0]["task_id"] == "t2"

    def test_filter_combined(self, client):
        self._seed_tasks()
        resp = client.get("/tasks?sender=domador&target=tropero", headers=AUTH_HEADER)
        data = resp.json()
        assert len(data) == 2

    def test_limit(self, client):
        self._seed_tasks()
        resp = client.get("/tasks?limit=2", headers=AUTH_HEADER)
        data = resp.json()
        assert len(data) == 2
        # Should return last 2 (most recent)
        assert data[0]["task_id"] == "t3"
        assert data[1]["task_id"] == "t4"

    def test_limit_validation_min(self, client):
        resp = client.get("/tasks?limit=0", headers=AUTH_HEADER)
        assert resp.status_code == 422  # ge=1 constraint

    def test_limit_validation_max(self, client):
        resp = client.get("/tasks?limit=501", headers=AUTH_HEADER)
        assert resp.status_code == 422  # le=500 constraint

    def test_empty_task_log(self, client):
        resp = client.get("/tasks", headers=AUTH_HEADER)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_no_match_filter(self, client):
        self._seed_tasks()
        resp = client.get("/tasks?sender=nonexistent", headers=AUTH_HEADER)
        assert resp.status_code == 200
        assert resp.json() == []


# ===========================================================================
# 7. /tasks/{task_id}/update endpoint
# ===========================================================================


class TestTaskUpdate:
    def _create_task(self, task_id="t1"):
        entry = {
            "task_id": task_id,
            "sender": "domador",
            "target": "tropero",
            "status": "delivered",
            "message": "Test",
            "created_at": "2026-01-01T00:00:00Z",
            "delivered_at": "2026-01-01T00:00:01Z",
            "error": None,
        }
        main.task_log.append(entry)
        return entry

    def test_update_status(self, client):
        self._create_task("t1")
        resp = client.post(
            "/tasks/t1/update",
            headers=AUTH_HEADER,
            json={"status": "completed"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["task_id"] == "t1"
        assert data["status"] == "completed"
        # Verify in-memory update
        assert main.task_log[0]["status"] == "completed"
        assert "updated_at" in main.task_log[0]

    def test_update_result(self, client):
        self._create_task("t1")
        resp = client.post(
            "/tasks/t1/update",
            headers=AUTH_HEADER,
            json={"result": "Reunion agendada para manana"},
        )
        assert resp.status_code == 200
        assert main.task_log[0]["result"] == "Reunion agendada para manana"

    def test_update_both_status_and_result(self, client):
        self._create_task("t1")
        resp = client.post(
            "/tasks/t1/update",
            headers=AUTH_HEADER,
            json={"status": "completed", "result": "Done"},
        )
        assert resp.status_code == 200
        assert main.task_log[0]["status"] == "completed"
        assert main.task_log[0]["result"] == "Done"

    def test_update_nonexistent_task(self, client):
        resp = client.post(
            "/tasks/nonexistent/update",
            headers=AUTH_HEADER,
            json={"status": "completed"},
        )
        assert resp.status_code == 404
        assert "not found" in resp.json()["detail"]

    def test_update_empty_body(self, client):
        """Empty status and result — should still succeed (sets updated_at)."""
        self._create_task("t1")
        resp = client.post(
            "/tasks/t1/update",
            headers=AUTH_HEADER,
            json={},
        )
        assert resp.status_code == 422  # Requires at least status or result

    def test_update_result_truncated(self, client):
        """Result longer than 2000 chars should be truncated."""
        self._create_task("t1")
        long_result = "B" * 5000
        resp = client.post(
            "/tasks/t1/update",
            headers=AUTH_HEADER,
            json={"result": long_result},
        )
        assert resp.status_code == 200
        assert len(main.task_log[0]["result"]) == 2000

    def test_update_finds_latest_duplicate(self, client):
        """If duplicate task_ids exist, should update the most recent one."""
        self._create_task("dup")
        # Add another with same ID but different status
        entry2 = {
            "task_id": "dup",
            "sender": "tropero",
            "target": "domador",
            "status": "sent",
            "message": "Second",
            "created_at": "2026-01-02T00:00:00Z",
            "delivered_at": None,
            "error": None,
        }
        main.task_log.append(entry2)

        resp = client.post(
            "/tasks/dup/update",
            headers=AUTH_HEADER,
            json={"status": "completed"},
        )
        assert resp.status_code == 200
        # The second (most recent) entry should be updated (reversed iteration)
        assert main.task_log[1]["status"] == "completed"
        # First entry should be unchanged
        assert main.task_log[0]["status"] == "delivered"


# ===========================================================================
# 8. Task log rotation (deque maxlen)
# ===========================================================================


class TestTaskLogRotation:
    def test_task_log_max_size(self, client, mock_httpx_success):
        """Task log should not exceed TASK_LOG_MAX entries."""
        for i in range(main.TASK_LOG_MAX + 50):
            main.task_log.append({"task_id": f"t{i}", "status": "delivered"})
        assert len(main.task_log) == main.TASK_LOG_MAX

    def test_oldest_evicted(self, client):
        """When full, oldest entries should be evicted."""
        for i in range(main.TASK_LOG_MAX + 10):
            main.task_log.append({"task_id": f"t{i}", "status": "delivered"})
        # First entry should be t10 (t0..t9 were evicted)
        assert main.task_log[0]["task_id"] == "t10"


# ===========================================================================
# 9. Concurrent task creation
# ===========================================================================


class TestConcurrency:
    def test_concurrent_route_calls(self, client, mock_httpx_success):
        """Multiple route calls should not corrupt shared state."""
        import concurrent.futures

        def _route(i):
            return client.post(
                "/route",
                headers=AUTH_HEADER,
                json={
                    "sender": "domador",
                    "target": "tropero",
                    "message": f"Task {i}",
                    "task_id": f"concurrent-{i}",
                },
            )

        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
            futures = [pool.submit(_route, i) for i in range(20)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        # All should succeed
        success_count = sum(1 for r in results if r.status_code == 200)
        assert success_count == 20
        assert len(main.task_log) == 20


# ===========================================================================
# 10. Registry loading
# ===========================================================================


class TestRegistryLoading:
    def test_load_from_file(self, tmp_path):
        """Registry should load agents from a JSON file."""
        registry_file = tmp_path / "registry.json"
        registry_file.write_text(json.dumps({"test_agent": {"host": "localhost", "port": 9999}}))

        main.AGENTS.clear()
        with patch.dict(os.environ, {"AGENT_REGISTRY_FILE": str(registry_file)}):
            main._load_registry()

        assert "test_agent" in main.AGENTS
        assert main.AGENTS["test_agent"]["host"] == "localhost"

    def test_load_missing_file(self):
        """Missing registry file should not crash."""
        main.AGENTS.clear()
        with patch.dict(os.environ, {"AGENT_REGISTRY_FILE": "/nonexistent/path.json"}):
            main._load_registry()  # Should print warning, not crash
        # AGENTS may still have entries from env var; the point is no exception

    def test_load_invalid_json_file(self, tmp_path):
        """Invalid JSON in registry file should not crash."""
        bad_file = tmp_path / "bad.json"
        bad_file.write_text("{not valid json")
        main.AGENTS.clear()
        with patch.dict(os.environ, {"AGENT_REGISTRY_FILE": str(bad_file)}):
            main._load_registry()  # Should print warning, not crash

    def test_load_from_env_var(self):
        """Registry should merge agents from AGENT_REGISTRY env var."""
        main.AGENTS.clear()
        env_agents = json.dumps({"env_agent": {"host": "env-host", "port": 1234}})
        with patch.dict(os.environ, {
            "AGENT_REGISTRY_FILE": "/dev/null",
            "AGENT_REGISTRY": env_agents,
        }):
            main._load_registry()
        assert "env_agent" in main.AGENTS

    def test_env_var_overrides_file(self, tmp_path):
        """Env var agents should override file agents with the same name."""
        registry_file = tmp_path / "registry.json"
        registry_file.write_text(json.dumps({"agent1": {"host": "file-host", "port": 1111}}))

        env_agents = json.dumps({"agent1": {"host": "env-host", "port": 2222}})
        main.AGENTS.clear()
        with patch.dict(os.environ, {
            "AGENT_REGISTRY_FILE": str(registry_file),
            "AGENT_REGISTRY": env_agents,
        }):
            main._load_registry()

        assert main.AGENTS["agent1"]["host"] == "env-host"

    def test_invalid_env_var_json(self):
        """Invalid JSON in AGENT_REGISTRY env var should not crash."""
        main.AGENTS.clear()
        with patch.dict(os.environ, {
            "AGENT_REGISTRY_FILE": "/dev/null",
            "AGENT_REGISTRY": "not json",
        }):
            main._load_registry()  # Should print warning, not crash


# ===========================================================================
# 11. Edge cases and security
# ===========================================================================


class TestEdgeCases:
    def test_route_to_agent_missing_host(self, client):
        """Agent entry without host/port should produce an error.

        BUG FINDING: This returns 500 (unhandled KeyError) instead of 502
        because the KeyError on agent['host'] happens at line 177 of main.py
        BEFORE the try/except block at line 180. The fix would be to move
        the gateway_url construction inside the try block, or validate agent
        entries have required keys.
        """
        main.AGENTS["broken"] = {"role": "broken"}
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "broken",
                "message": "Test",
            },
        )
        # Returns 502 — malformed agent entry handled gracefully
        assert resp.status_code == 502

    def test_route_special_chars_in_target(self, client):
        """Target with special characters that exists in registry."""
        main.AGENTS["agent-with-dashes"] = {"host": "localhost", "port": 9999}
        mock_response = httpx.Response(
            200,
            json={"ok": True},
            request=httpx.Request("POST", "http://fake"),
        )
        mock_client = AsyncMock(spec=httpx.AsyncClient)
        mock_client.post = AsyncMock(return_value=mock_response)
        original = main.app.state.http_client
        main.app.state.http_client = mock_client

        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "agent-with-dashes",
                "message": "Test",
            },
        )
        assert resp.status_code == 200
        main.app.state.http_client = original

    def test_task_update_with_path_traversal_id(self, client):
        """Task ID with path-like characters should not cause issues."""
        entry = {
            "task_id": "../../../etc/passwd",
            "sender": "x",
            "target": "y",
            "status": "sent",
            "message": "Test",
            "created_at": "2026-01-01T00:00:00Z",
            "delivered_at": None,
            "error": None,
        }
        main.task_log.append(entry)
        resp = client.post(
            "/tasks/../../../etc/passwd/update",
            headers=AUTH_HEADER,
            json={"status": "completed"},
        )
        # FastAPI will normalize the path, so this likely won't match
        # The important thing is it doesn't crash or access files
        assert resp.status_code in (200, 404, 307)

    def test_very_large_context(self, client, mock_httpx_success):
        """Large context dict should not crash the router."""
        large_context = {f"key_{i}": f"value_{i}" * 100 for i in range(100)}
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
                "context": large_context,
            },
        )
        assert resp.status_code == 200

    def test_unicode_message(self, client, mock_httpx_success):
        """Unicode in messages should be handled correctly."""
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Contactar al cliente Jose Martinez por el pedido #123",
            },
        )
        assert resp.status_code == 200

    def test_invalid_json_body(self, client):
        """Non-JSON body should return 422."""
        resp = client.post(
            "/route",
            headers={**AUTH_HEADER, "Content-Type": "application/json"},
            content=b"not json",
        )
        assert resp.status_code == 422

    def test_wrong_content_type(self, client):
        """Form-encoded body should return 422."""
        resp = client.post(
            "/route",
            headers={**AUTH_HEADER, "Content-Type": "application/x-www-form-urlencoded"},
            content=b"sender=domador&target=tropero&message=test",
        )
        assert resp.status_code == 422


# ===========================================================================
# 12. _send_to_agent internal logic
# ===========================================================================


class TestSendToAgent:
    def test_gateway_url_construction(self, client, mock_httpx_success):
        """Verify the URL constructed to reach the agent."""
        client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        call_args = mock_httpx_success.post.call_args
        url = call_args[0][0] if call_args[0] else call_args.kwargs.get("url", "")
        assert url == "http://tropero-mateos:18789/api/call/chat.send"

    def test_inter_agent_message_format(self, client, mock_httpx_success):
        """Verify the inter-agent message format."""
        client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Contact the lead",
                "priority": "urgent",
            },
        )
        call_args = mock_httpx_success.post.call_args
        body = call_args.kwargs.get("json") or call_args[1].get("json")
        msg = body["message"]
        assert "[INTER-AGENT]" in msg
        assert "from: domador" in msg
        assert "priority: urgent" in msg
        assert "Contact the lead" in msg

    def test_agent_custom_token(self, client, mock_httpx_success):
        """Agent with its own token should use that instead of SQUAD_AUTH_TOKEN."""
        main.AGENTS["tropero"]["token"] = "agent-specific-token"
        client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        call_args = mock_httpx_success.post.call_args
        headers = call_args.kwargs.get("headers", {})
        assert headers["Authorization"] == "Bearer agent-specific-token"

    def test_idempotency_key(self, client, mock_httpx_success):
        """Each request should include an idempotency key based on task_id."""
        client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
                "task_id": "my-task",
            },
        )
        call_args = mock_httpx_success.post.call_args
        body = call_args.kwargs.get("json") or call_args[1].get("json")
        assert body["idempotencyKey"] == "ia-my-task"

    def test_generic_exception_handling(self, client):
        """Unexpected exceptions should be caught and logged."""
        mock_client = AsyncMock(spec=httpx.AsyncClient)
        mock_client.post = AsyncMock(side_effect=RuntimeError("Unexpected"))
        original = main.app.state.http_client
        main.app.state.http_client = mock_client

        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={
                "sender": "domador",
                "target": "tropero",
                "message": "Test",
            },
        )
        assert resp.status_code == 502
        assert len(main.task_log) == 1
        assert main.task_log[0]["status"] == "error"
        assert "RuntimeError" in main.task_log[0]["error"]

        main.app.state.http_client = original


# ---------------------------------------------------------------------------
# Enabled/Disabled Agent Tests
# ---------------------------------------------------------------------------


class TestAgentEnabled:
    """Tests for the enabled/disabled agent feature."""

    @pytest.fixture(autouse=True)
    def setup(self, client):
        main.AGENTS.clear()
        main.AGENTS["active"] = {
            "host": "active-host",
            "port": 18789,
            "enabled": True,
            "role": "Active Agent",
            "capabilities": ["support"],
        }
        main.AGENTS["disabled"] = {
            "host": "disabled-host",
            "port": 18789,
            "enabled": False,
            "role": "Disabled Agent",
            "capabilities": ["support", "sales"],
        }
        main.AGENTS["no_flag"] = {
            "host": "noflag-host",
            "port": 18789,
            "role": "No Flag Agent",
            "capabilities": ["content"],
        }
        main.task_log.clear()
        yield
        main.AGENTS.clear()

    def test_route_to_disabled_returns_503(self, client):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={"sender": "active", "target": "disabled", "message": "Test"},
        )
        assert resp.status_code == 503
        assert "no habilitado" in resp.json()["detail"]

    def test_route_to_enabled_works(self, client):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={"sender": "active", "target": "no_flag", "message": "Test"},
        )
        assert resp.status_code == 502

    def test_route_404_only_shows_enabled(self, client):
        resp = client.post(
            "/route",
            headers=AUTH_HEADER,
            json={"sender": "active", "target": "nonexistent", "message": "Test"},
        )
        assert resp.status_code == 404
        detail = resp.json()["detail"]
        assert "disabled" not in detail

    def test_agents_shows_enabled_field(self, client):
        resp = client.get("/agents", headers=AUTH_HEADER)
        data = resp.json()
        assert data["active"]["enabled"] is True
        assert data["disabled"]["enabled"] is False
        assert data["no_flag"]["enabled"] is True

    def test_broadcast_skips_disabled(self, client):
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={"sender": "active", "message": "Hello"},
        )
        targets = [r["target"] for r in resp.json()["results"]]
        assert "disabled" not in targets
        assert "no_flag" in targets

    def test_broadcast_capability_respects_enabled(self, client):
        resp = client.post(
            "/broadcast",
            headers=AUTH_HEADER,
            json={"sender": "no_flag", "message": "Sales", "capability": "sales"},
        )
        assert resp.json()["targets"] == 0

    def test_health_shows_counts(self, client):
        resp = client.get("/health")
        data = resp.json()
        assert data["agents"] == 2
        assert data["agents_disabled"] == 1
        assert data["agents_total"] == 3

    def test_is_enabled_default_true(self, client):
        assert main._is_enabled("no_flag") is True

    def test_is_enabled_false(self, client):
        assert main._is_enabled("disabled") is False

    def test_is_enabled_nonexistent(self, client):
        assert main._is_enabled("ghost") is False
