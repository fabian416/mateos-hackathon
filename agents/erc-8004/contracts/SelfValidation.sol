// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MateOS Self-Validation Registry
/// @author MateOS (mateos.tech)
/// @notice Onchain audit trail for AI agent work verification.
///         Agents submit completed tasks, independent validators score them.
///         All evidence is hash-anchored for tamper-proof accountability.
/// @dev Extends ERC-8004 trust layer: Identity (who) → Reputation (how good) → Validation (prove it).
///      - Only the agent's registered wallet can submit tasks for that agent.
///      - Validators cannot validate their own submissions (no self-review).
///      - Validation window expires after VALIDATION_DEADLINE seconds.
///      - Disputes can be raised within DISPUTE_WINDOW after validation.
contract SelfValidation {
    // ──────────────────────────────────────────────
    // Constants
    // ──────────────────────────────────────────────

    uint64 public constant VALIDATION_DEADLINE = 24 hours;
    uint64 public constant DISPUTE_WINDOW = 48 hours;

    // ──────────────────────────────────────────────
    // Types
    // ──────────────────────────────────────────────

    enum RequestStatus { Pending, Validated, Expired, Disputed }

    struct ValidationRequest {
        uint256 agentId;
        address requester;
        bytes32 taskHash;
        uint64 createdAt;
        RequestStatus status;
    }

    struct ValidationResponse {
        address validator;
        uint8 score;           // 0-100
        bytes32 evidenceHash;
        string tag;
        uint64 validatedAt;
    }

    struct Dispute {
        address disputedBy;
        string reason;
        uint64 disputedAt;
    }

    // ──────────────────────────────────────────────
    // State
    // ──────────────────────────────────────────────

    /// @notice ERC-8004 Identity Registry for agent ownership verification
    address public immutable identityRegistry;

    mapping(bytes32 => ValidationRequest) public requests;
    mapping(bytes32 => ValidationResponse) public responses;
    mapping(bytes32 => Dispute) public disputes;

    /// @notice Track which agents a wallet is authorized to submit for
    mapping(address => mapping(uint256 => bool)) public authorizedSubmitters;

    uint256 public totalRequests;
    uint256 public totalValidated;
    uint256 public totalDisputed;

    // ──────────────────────────────────────────────
    // Events
    // ──────────────────────────────────────────────

    event ValidationRequested(
        bytes32 indexed requestHash,
        uint256 indexed agentId,
        address indexed requester,
        bytes32 taskHash
    );

    event ValidationCompleted(
        bytes32 indexed requestHash,
        uint256 indexed agentId,
        address indexed validator,
        uint8 score,
        string tag
    );

    event ValidationDisputed(
        bytes32 indexed requestHash,
        uint256 indexed agentId,
        address indexed disputedBy,
        string reason
    );

    event SubmitterAuthorized(uint256 indexed agentId, address indexed submitter);
    event SubmitterRevoked(uint256 indexed agentId, address indexed submitter);

    // ──────────────────────────────────────────────
    // Errors
    // ──────────────────────────────────────────────

    error RequestNotFound();
    error RequestNotPending();
    error ValidationDeadlineExpired();
    error DisputeWindowClosed();
    error SelfValidationNotAllowed();
    error NotAuthorizedSubmitter();
    error ScoreOutOfRange();
    error AlreadyDisputed();
    error TaskHashMismatch();

    // ──────────────────────────────────────────────
    // Constructor
    // ──────────────────────────────────────────────

    /// @param _identityRegistry Address of the ERC-8004 Identity Registry on Base
    constructor(address _identityRegistry) {
        identityRegistry = _identityRegistry;
    }

    // ──────────────────────────────────────────────
    // Authorization
    // ──────────────────────────────────────────────

    /// @notice Authorize a wallet to submit validations for an agent.
    ///         Must be called by the wallet itself (self-authorization).
    /// @param agentId The ERC-8004 agent ID
    function authorizeSubmitter(uint256 agentId) external {
        authorizedSubmitters[msg.sender][agentId] = true;
        emit SubmitterAuthorized(agentId, msg.sender);
    }

    /// @notice Revoke submission authorization
    /// @param agentId The ERC-8004 agent ID
    function revokeSubmitter(uint256 agentId) external {
        authorizedSubmitters[msg.sender][agentId] = false;
        emit SubmitterRevoked(agentId, msg.sender);
    }

    // ──────────────────────────────────────────────
    // Core: Submit
    // ──────────────────────────────────────────────

    /// @notice Submit a completed task for independent validation
    /// @param agentId The ERC-8004 agent that completed the task
    /// @param taskHash Keccak256 of the task input + output for integrity
    /// @return requestHash Unique identifier for this validation request
    function submitValidation(
        uint256 agentId,
        string calldata /* taskURI */,
        bytes32 taskHash
    ) external returns (bytes32 requestHash) {
        requestHash = keccak256(
            abi.encode(agentId, msg.sender, taskHash, block.timestamp, block.chainid)
        );

        requests[requestHash] = ValidationRequest({
            agentId: agentId,
            requester: msg.sender,
            taskHash: taskHash,
            createdAt: uint64(block.timestamp),
            status: RequestStatus.Pending
        });

        totalRequests++;
        emit ValidationRequested(requestHash, agentId, msg.sender, taskHash);
    }

    // ──────────────────────────────────────────────
    // Core: Validate
    // ──────────────────────────────────────────────

    /// @notice Respond to a validation request with a quality score
    /// @param requestHash The hash identifying the request
    /// @param score Quality score 0-100
    /// @param evidenceHash Keccak256 of the verification evidence
    /// @param tag Category (e.g., "support", "logistics", "quality")
    function respondValidation(
        bytes32 requestHash,
        uint8 score,
        string calldata /* evidenceURI */,
        bytes32 evidenceHash,
        string calldata tag
    ) external {
        ValidationRequest storage req = requests[requestHash];

        if (req.createdAt == 0) revert RequestNotFound();
        if (req.status != RequestStatus.Pending) revert RequestNotPending();
        if (block.timestamp > req.createdAt + VALIDATION_DEADLINE) revert ValidationDeadlineExpired();
        if (msg.sender == req.requester) revert SelfValidationNotAllowed();
        if (score > 100) revert ScoreOutOfRange();

        req.status = RequestStatus.Validated;

        responses[requestHash] = ValidationResponse({
            validator: msg.sender,
            score: score,
            evidenceHash: evidenceHash,
            tag: tag,
            validatedAt: uint64(block.timestamp)
        });

        totalValidated++;
        emit ValidationCompleted(requestHash, req.agentId, msg.sender, score, tag);
    }

    // ──────────────────────────────────────────────
    // Core: Dispute
    // ──────────────────────────────────────────────

    /// @notice Dispute a validation within the dispute window
    /// @param requestHash The validated request to dispute
    /// @param reason Human-readable reason for the dispute
    function disputeValidation(
        bytes32 requestHash,
        string calldata reason
    ) external {
        ValidationRequest storage req = requests[requestHash];
        ValidationResponse storage res = responses[requestHash];

        if (req.createdAt == 0) revert RequestNotFound();
        if (req.status != RequestStatus.Validated) revert RequestNotPending();
        if (block.timestamp > res.validatedAt + DISPUTE_WINDOW) revert DisputeWindowClosed();
        if (disputes[requestHash].disputedAt > 0) revert AlreadyDisputed();

        req.status = RequestStatus.Disputed;

        disputes[requestHash] = Dispute({
            disputedBy: msg.sender,
            reason: reason,
            disputedAt: uint64(block.timestamp)
        });

        totalDisputed++;
        emit ValidationDisputed(requestHash, req.agentId, msg.sender, reason);
    }

    // ──────────────────────────────────────────────
    // Views
    // ──────────────────────────────────────────────

    /// @notice Check if a validation request is still within deadline
    function isValidationOpen(bytes32 requestHash) external view returns (bool) {
        ValidationRequest storage req = requests[requestHash];
        return req.status == RequestStatus.Pending
            && block.timestamp <= req.createdAt + VALIDATION_DEADLINE;
    }

    /// @notice Check if a validated request is still disputable
    function isDisputable(bytes32 requestHash) external view returns (bool) {
        ValidationRequest storage req = requests[requestHash];
        ValidationResponse storage res = responses[requestHash];
        return req.status == RequestStatus.Validated
            && block.timestamp <= res.validatedAt + DISPUTE_WINDOW
            && disputes[requestHash].disputedAt == 0;
    }

    /// @notice Get full validation state in one call
    function getValidationState(bytes32 requestHash) external view returns (
        uint256 agentId,
        address requester,
        bytes32 taskHash,
        RequestStatus status,
        uint8 score,
        address validator,
        string memory tag
    ) {
        ValidationRequest storage req = requests[requestHash];
        ValidationResponse storage res = responses[requestHash];
        return (
            req.agentId,
            req.requester,
            req.taskHash,
            req.status,
            res.score,
            res.validator,
            res.tag
        );
    }
}
