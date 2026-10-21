// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Jamhuriat
 * @dev Decentralized & Transparent Voting Infrastructure for Pakistan
 * @notice Secure blockchain voting with CNIC verification and real-time auditing.
 */
contract Jamhuriat {

    // ─────────────────────────────────────────────
    //  STRUCTS
    // ─────────────────────────────────────────────

    struct Candidate {
        uint256 id;
        string cnic;            // 13-digit CNIC
        string fullName;
        uint8  age;
        string region;          // Constituency
        string party;           // Political affiliation
        string manifesto;       // Policy statement
        string metadata;        // Extra info (education, record, etc.)
        bool   isApproved;      // Admin approval status
        uint256 voteCount;
        uint256 registeredAt;
    }

    struct Voter {
        string cnic;
        string fullName;
        uint8  age;
        string region;
        bool   hasVoted;
        uint256 votedFor;       // Candidate ID
        uint256 registeredAt;
    }

    struct Election {
        string  name;
        uint256 startTime;
        uint256 endTime;
        bool    isActive;
        uint256 totalVotes;
    }

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    address public admin;
    Election public currentElection;

    uint256 private candidateCount;
    uint256 private voterCount;

    // cnicHash => Candidate
    mapping(bytes32 => Candidate) private candidates;
    // cnicHash => Voter
    mapping(bytes32 => Voter)     private voters;
    // candidateId => cnicHash
    mapping(uint256 => bytes32)   private candidateById;
    // Track registered CNICs
    mapping(bytes32 => bool) private registeredCNICs;

    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────

    event CandidateRegistered(uint256 indexed id, string fullName, string region);
    event CandidateApproved(uint256 indexed id, string fullName);
    event VoterRegistered(bytes32 indexed cnicHash, string region);
    event VoteCast(bytes32 indexed voterHash, uint256 indexed candidateId);
    event ElectionStarted(string name, uint256 startTime, uint256 endTime);
    event ElectionEnded(uint256 totalVotes);

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Jamhuriat: Admin access required");
        _;
    }

    modifier electionActive() {
        require(currentElection.isActive, "Jamhuriat: No active session");
        require(block.timestamp >= currentElection.startTime, "Jamhuriat: Session not yet started");
        require(block.timestamp <= currentElection.endTime,   "Jamhuriat: Session concluded");
        _;
    }

    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────
    //  ADMIN FUNCTIONS
    // ─────────────────────────────────────────────

    function createElection(string memory _name, uint256 _durationSeconds) external onlyAdmin {
        require(!currentElection.isActive, "Jamhuriat: Existing session active");
        currentElection = Election({
            name:       _name,
            startTime:  block.timestamp,
            endTime:    block.timestamp + _durationSeconds,
            isActive:   true,
            totalVotes: 0
        });
        emit ElectionStarted(_name, block.timestamp, currentElection.endTime);
    }

    function approveCandidate(uint256 _candidateId) external onlyAdmin {
        bytes32 h = candidateById[_candidateId];
        require(h != bytes32(0), "Jamhuriat: Invalid candidate ID");
        candidates[h].isApproved = true;
        emit CandidateApproved(_candidateId, candidates[h].fullName);
    }

    function endElection() external onlyAdmin {
        require(currentElection.isActive, "Jamhuriat: No active session");
        currentElection.isActive = false;
        emit ElectionEnded(currentElection.totalVotes);
    }

    /**
     * @dev Removes a candidate from the system.
     * @param _candidateId The unique ID of the candidate.
     */
    function deleteCandidate(uint256 _candidateId) external onlyAdmin {
        bytes32 h = candidateById[_candidateId];
        require(h != bytes32(0), "Jamhuriat: Invalid candidate ID");
        
        // Remove from mappings
        delete registeredCNICs[h];
        delete candidates[h];
        delete candidateById[_candidateId];
    }

    /**
     * @dev Removes a voter from the system.
     * @param _cnic The CNIC of the voter to delete.
     */
    function deleteVoter(string memory _cnic) external onlyAdmin {
        bytes32 h = keccak256(abi.encodePacked(_cnic));
        require(bytes(voters[h].cnic).length > 0, "Jamhuriat: Voter not found");
        
        // Remove from mappings
        delete registeredCNICs[h];
        delete voters[h];
    }

    // ─────────────────────────────────────────────
    //  REGISTRATION
    // ─────────────────────────────────────────────

    function registerCandidate(
        string memory _cnic,
        string memory _name,
        uint8         _age,
        string memory _region,
        string memory _party,
        string memory _manifesto,
        string memory _metadata
    ) external {
        require(_age >= 25, "Jamhuriat: Minimum age is 25");
        bytes32 h = keccak256(abi.encodePacked(_cnic));
        require(!registeredCNICs[h], "Jamhuriat: CNIC already utilized");

        candidateCount++;
        candidates[h] = Candidate({
            id:               candidateCount,
            cnic:             _cnic,
            fullName:         _name,
            age:              _age,
            region:           _region,
            party:            _party,
            manifesto:        _manifesto,
            metadata:         _metadata,
            isApproved:       false,
            voteCount:        0,
            registeredAt:     block.timestamp
        });

        candidateById[candidateCount] = h;
        registeredCNICs[h]            = true;
        emit CandidateRegistered(candidateCount, _name, _region);
    }

    function registerVoter(
        string memory _cnic,
        string memory _name,
        uint8         _age,
        string memory _region
    ) external {
        require(_age >= 18, "Jamhuriat: Minimum age is 18");
        bytes32 h = keccak256(abi.encodePacked(_cnic));
        require(!registeredCNICs[h], "Jamhuriat: CNIC already utilized");

        voters[h] = Voter({
            cnic:         _cnic,
            fullName:     _name,
            age:          _age,
            region:       _region,
            hasVoted:     false,
            votedFor:     0,
            registeredAt: block.timestamp
        });

        registeredCNICs[h] = true;
        voterCount++;
        emit VoterRegistered(h, _region);
    }

    // ─────────────────────────────────────────────
    //  VOTING
    // ─────────────────────────────────────────────

    function castVote(string memory _voterCnic, uint256 _candidateId) external electionActive {
        bytes32 vh = keccak256(abi.encodePacked(_voterCnic));
        Voter storage voter = voters[vh];

        require(bytes(voter.cnic).length > 0, "Jamhuriat: CNIC not registered");
        require(!voter.hasVoted,              "Jamhuriat: Vote already cast");

        bytes32 ch = candidateById[_candidateId];
        require(ch != bytes32(0), "Jamhuriat: Candidate not found");
        require(candidates[ch].isApproved, "Jamhuriat: Candidate not certified");
        
        // Region enforcement
        require(
            keccak256(bytes(voter.region)) == keccak256(bytes(candidates[ch].region)),
            "Jamhuriat: Regional mismatch"
        );

        voter.hasVoted  = true;
        voter.votedFor  = _candidateId;
        candidates[ch].voteCount++;
        currentElection.totalVotes++;

        emit VoteCast(vh, _candidateId);
    }

    // ─────────────────────────────────────────────
    //  GETTERS
    // ─────────────────────────────────────────────

    function getCandidateCount() external view returns (uint256) { return candidateCount; }
    function getVoterCount() external view returns (uint256) { return voterCount; }

    function getCandidateById(uint256 _id) external view returns (
        uint256 id, string memory fullName, uint8 age,
        string memory region, string memory party, string memory manifesto,
        string memory metadata, bool isApproved, uint256 voteCount
    ) {
        bytes32 h = candidateById[_id];
        require(h != bytes32(0), "Jamhuriat: Not found");
        Candidate memory c = candidates[h];
        return (c.id, c.fullName, c.age, c.region, c.party, c.manifesto, c.metadata, c.isApproved, c.voteCount);
    }

    function getVoterById(string memory _cnic) external view returns (
        string memory fullName, uint8 age, string memory region, bool hasVoted, uint256 votedFor
    ) {
        bytes32 h = keccak256(abi.encodePacked(_cnic));
        Voter memory v = voters[h];
        require(bytes(v.cnic).length > 0, "Jamhuriat: Voter not found");
        return (v.fullName, v.age, v.region, v.hasVoted, v.votedFor);
    }

    function getElectionInfo() external view returns (
        string memory name, uint256 startTime, uint256 endTime, bool isActive, uint256 totalVotes
    ) {
        return (currentElection.name, currentElection.startTime, currentElection.endTime, currentElection.isActive, currentElection.totalVotes);
    }
}
