// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MateOS Self-Validation Registry
/// @notice Onchain proof that AI agents verify their own work
/// @dev Follows ERC-8004 validation pattern: request → verify → respond
contract SelfValidation {
    struct ValidationRequest {
        uint256 agentId;
        address requester;
        string taskURI;
        bytes32 taskHash;
        uint64 timestamp;
        bool resolved;
    }

    struct ValidationResponse {
        address validator;
        uint8 score; // 0-100
        string evidenceURI;
        bytes32 evidenceHash;
        string tag;
        uint64 timestamp;
    }

    mapping(bytes32 => ValidationRequest) public requests;
    mapping(bytes32 => ValidationResponse) public responses;

    uint256 public totalRequests;
    uint256 public totalResponses;

    event ValidationRequested(
        bytes32 indexed requestHash,
        uint256 indexed agentId,
        address indexed requester,
        string taskURI,
        bytes32 taskHash
    );

    event ValidationCompleted(
        bytes32 indexed requestHash,
        uint256 indexed agentId,
        address indexed validator,
        uint8 score,
        string tag
    );

    /// @notice Submit a task for validation
    /// @param agentId The ERC-8004 agent that completed the task
    /// @param taskURI Link to task details (IPFS or HTTPS)
    /// @param taskHash Keccak256 of the task input+output for integrity
    function submitValidation(
        uint256 agentId,
        string calldata taskURI,
        bytes32 taskHash
    ) external returns (bytes32 requestHash) {
        requestHash = keccak256(abi.encodePacked(agentId, msg.sender, taskHash, block.timestamp));

        requests[requestHash] = ValidationRequest({
            agentId: agentId,
            requester: msg.sender,
            taskURI: taskURI,
            taskHash: taskHash,
            timestamp: uint64(block.timestamp),
            resolved: false
        });

        totalRequests++;

        emit ValidationRequested(requestHash, agentId, msg.sender, taskURI, taskHash);
    }

    /// @notice Respond to a validation request with a score
    /// @param requestHash The hash of the original request
    /// @param score Quality score 0-100
    /// @param evidenceURI Link to verification evidence
    /// @param evidenceHash Keccak256 of the evidence for integrity
    /// @param tag Category tag (e.g. "support", "sales", "logistics")
    function respondValidation(
        bytes32 requestHash,
        uint8 score,
        string calldata evidenceURI,
        bytes32 evidenceHash,
        string calldata tag
    ) external {
        ValidationRequest storage req = requests[requestHash];
        require(req.timestamp > 0, "Request not found");
        require(!req.resolved, "Already resolved");
        require(score <= 100, "Score must be 0-100");

        req.resolved = true;

        responses[requestHash] = ValidationResponse({
            validator: msg.sender,
            score: score,
            evidenceURI: evidenceURI,
            evidenceHash: evidenceHash,
            tag: tag,
            timestamp: uint64(block.timestamp)
        });

        totalResponses++;

        emit ValidationCompleted(requestHash, req.agentId, msg.sender, score, tag);
    }
}
