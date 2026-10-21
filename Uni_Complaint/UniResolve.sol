// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UniResolve
 * @notice Blockchain-based University Complaint Management System
 * @dev Implements role-based access, voting, escalation, feedback, and audit trail
 * @author Muhammad Jawad Raza (Reg: 235119)
 */
contract UniResolve {

    // ─────────────────────────────────────────────
    //  ENUMS
    // ─────────────────────────────────────────────

    /// @notice Lifecycle stages of a complaint
    enum Status {
        Pending,
        Assigned,
        InProgress,
        Resolved,
        Closed,
        Reopened,
        Escalated
    }

    /// @notice Urgency levels for complaints
    enum Priority {
        Low,
        Medium,
        High,
        Emergency
    }

    /// @notice Complaint categories mapping to departments
    enum Category {
        AcademicAffairs,
        Examination,
        Hostel,
        Transport,
        Laboratory,
        CampusFacilities,
        Cafeteria,
        Administration,
        Security,
        InternetWiFi,
        Library
    }

    /// @notice Platform roles for access control
    enum Role {
        None,
        Student,
        Admin,
        DepartmentOfficer,
        HostelManager,
        TransportOfficer,
        LabIncharge,
        ExaminationOfficer,
        FacultyRepresentative
    }

    // ─────────────────────────────────────────────
    //  STRUCTS
    // ─────────────────────────────────────────────

    /// @notice A single timeline event for a complaint
    struct TimelineEntry {
        uint256 timestamp;
        Status status;
        address actor;
        string note;
    }

    /// @notice Post-resolution student feedback
    struct Feedback {
        address student;
        uint8 rating;       // 1–5
        string comment;
        uint256 timestamp;
        bool exists;
    }

    /// @notice Core complaint record stored on-chain
    struct Complaint {
        uint256 id;
        address owner;          // student wallet (zero if anonymous)
        bool isAnonymous;
        string title;
        string description;
        Category category;
        Priority priority;
        Status status;
        address assignedTo;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 deadlineAt;     // expected resolution deadline
        uint256 escalatedAt;    // timestamp when escalated (0 if not)
        string fileHash;        // SHA-256 of uploaded evidence
        string fileUrl;         // Supabase Storage URL
        string adminNotes;
        uint256 voteCount;
        bool feedbackSubmitted;
    }

    // ─────────────────────────────────────────────
    //  CUSTOM ERRORS
    // ─────────────────────────────────────────────

    error UnauthorizedAccess(address caller, string reason);
    error ComplaintNotFound(uint256 complaintId);
    error DuplicateVote(address voter, uint256 complaintId);
    error InvalidStatusTransition(Status current, Status requested);
    error FeedbackAlreadySubmitted(uint256 complaintId);
    error InvalidRating(uint8 provided);
    error ComplaintNotResolved(uint256 complaintId);

    // ─────────────────────────────────────────────
    //  STATE VARIABLES
    // ─────────────────────────────────────────────

    address public immutable contractOwner;

    uint256 private _complaintCounter;

    /// @dev complaintId => Complaint
    mapping(uint256 => Complaint) private _complaints;

    /// @dev wallet => Role
    mapping(address => Role) private _roles;

    /// @dev complaintId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) private _votes;

    /// @dev complaintId => Feedback
    mapping(uint256 => Feedback) private _feedbacks;

    /// @dev complaintId => TimelineEntry[]
    mapping(uint256 => TimelineEntry[]) private _timelines;

    /// @dev student wallet => complaintId[]
    mapping(address => uint256[]) private _userComplaints;

    /// @dev all complaint IDs (for admin)
    uint256[] private _allComplaintIds;

    uint256 public constant ESCALATION_THRESHOLD = 7 days;
    uint256 public constant DEFAULT_DEADLINE = 14 days;

    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────

    event ComplaintCreated(
        uint256 indexed id,
        address indexed owner,
        Category category,
        Priority priority,
        bool isAnonymous,
        uint256 timestamp
    );

    event ComplaintAssigned(
        uint256 indexed id,
        address indexed assignedTo,
        uint256 timestamp
    );

    event StatusChanged(
        uint256 indexed id,
        Status oldStatus,
        Status newStatus,
        address actor,
        uint256 timestamp
    );

    event ComplaintEscalated(
        uint256 indexed id,
        address escalatedBy,
        uint256 timestamp
    );

    event ComplaintVoted(
        uint256 indexed id,
        address indexed voter,
        uint256 newVoteCount,
        uint256 timestamp
    );

    event FeedbackAdded(
        uint256 indexed id,
        address indexed student,
        uint8 rating,
        uint256 timestamp
    );

    event ComplaintClosed(
        uint256 indexed id,
        address closedBy,
        uint256 timestamp
    );

    event ComplaintReopened(
        uint256 indexed id,
        address reopenedBy,
        string reason,
        uint256 timestamp
    );

    event RoleAssigned(
        address indexed account,
        Role role,
        address assignedBy,
        uint256 timestamp
    );

    event AdminNoteAdded(
        uint256 indexed id,
        address admin,
        string note,
        uint256 timestamp
    );

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────

    /// @dev Restricts to contract owner (superadmin)
    modifier onlyOwner() {
        if (msg.sender != contractOwner)
            revert UnauthorizedAccess(msg.sender, "Not contract owner");
        _;
    }

    /// @dev Restricts to Admin role
    modifier onlyAdmin() {
        if (_roles[msg.sender] != Role.Admin && msg.sender != contractOwner)
            revert UnauthorizedAccess(msg.sender, "Not admin");
        _;
    }

    /// @dev Restricts to any authorized role (not Student/None)
    modifier onlyAuthorizedRole() {
        Role r = _roles[msg.sender];
        if (
            r == Role.None ||
            r == Role.Student
        ) {
            if (msg.sender != contractOwner)
                revert UnauthorizedAccess(msg.sender, "Insufficient role");
        }
        _;
    }

    /// @dev Validates a complaint exists
    modifier complaintExists(uint256 id) {
        if (_complaints[id].createdAt == 0)
            revert ComplaintNotFound(id);
        _;
    }

    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────

    /**
     * @notice Deploy and initialize the contract; deployer becomes owner + admin
     */
    constructor() {
        contractOwner = msg.sender;
        _roles[msg.sender] = Role.Admin;
        emit RoleAssigned(msg.sender, Role.Admin, msg.sender, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  ROLE MANAGEMENT
    // ─────────────────────────────────────────────

    /**
     * @notice Assign a role to a user address
     * @param account Wallet to assign role to
     * @param role Role enum value
     */
    function assignRole(address account, Role role) external onlyAdmin {
        _roles[account] = role;
        emit RoleAssigned(account, role, msg.sender, block.timestamp);
    }

    /**
     * @notice Read the role of any wallet
     * @param account Wallet to query
     * @return Role enum value
     */
    function getRole(address account) external view returns (Role) {
        return _roles[account];
    }

    // ─────────────────────────────────────────────
    //  COMPLAINT SUBMISSION
    // ─────────────────────────────────────────────

    /**
     * @notice Submit a new complaint on-chain
     * @param title Short title of the complaint
     * @param description Detailed complaint body
     * @param category Category enum value
     * @param priority Priority enum value
     * @param isAnonymous If true, owner address is hidden from non-admins
     * @param fileHash SHA-256 hash of the uploaded evidence file
     * @param fileUrl Supabase Storage URL of the evidence file
     * @return id The auto-generated complaint ID
     */
    function createComplaint(
        string calldata title,
        string calldata description,
        Category category,
        Priority priority,
        bool isAnonymous,
        string calldata fileHash,
        string calldata fileUrl
    ) external returns (uint256 id) {
        _complaintCounter++;
        id = _complaintCounter;

        address assignedTo = _autoAssign(category);

        _complaints[id] = Complaint({
            id: id,
            owner: isAnonymous ? address(0) : msg.sender,
            isAnonymous: isAnonymous,
            title: title,
            description: description,
            category: category,
            priority: priority,
            status: Status.Pending,
            assignedTo: assignedTo,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            deadlineAt: block.timestamp + DEFAULT_DEADLINE,
            escalatedAt: 0,
            fileHash: fileHash,
            fileUrl: fileUrl,
            adminNotes: "",
            voteCount: 0,
            feedbackSubmitted: false
        });

        _allComplaintIds.push(id);
        if (!isAnonymous) {
            _userComplaints[msg.sender].push(id);
        }

        _appendTimeline(id, Status.Pending, msg.sender, "Complaint created");

        if (assignedTo != address(0)) {
            _complaints[id].status = Status.Assigned;
            _appendTimeline(id, Status.Assigned, address(this), "Auto-assigned to department");
            emit ComplaintAssigned(id, assignedTo, block.timestamp);
        }

        emit ComplaintCreated(id, isAnonymous ? address(0) : msg.sender, category, priority, isAnonymous, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  COMPLAINT MANAGEMENT
    // ─────────────────────────────────────────────

    /**
     * @notice Manually assign a complaint to an officer
     * @param id Complaint ID
     * @param officer Wallet address of the officer
     */
    function assignComplaint(uint256 id, address officer)
        external
        onlyAdmin
        complaintExists(id)
    {
        Complaint storage c = _complaints[id];
        c.assignedTo = officer;
        c.status = Status.Assigned;
        c.updatedAt = block.timestamp;
        _appendTimeline(id, Status.Assigned, msg.sender, "Manually assigned by admin");
        emit ComplaintAssigned(id, officer, block.timestamp);
        emit StatusChanged(id, Status.Pending, Status.Assigned, msg.sender, block.timestamp);
    }

    /**
     * @notice Update the status of a complaint
     * @param id Complaint ID
     * @param newStatus Target status
     * @param note Optional note explaining the change
     */
    function updateStatus(uint256 id, Status newStatus, string calldata note)
        external
        onlyAuthorizedRole
        complaintExists(id)
    {
        Complaint storage c = _complaints[id];
        Status old = c.status;

        _validateTransition(old, newStatus);

        c.status = newStatus;
        c.updatedAt = block.timestamp;

        if (newStatus == Status.Closed) {
            emit ComplaintClosed(id, msg.sender, block.timestamp);
        }

        _appendTimeline(id, newStatus, msg.sender, bytes(note).length > 0 ? note : "Status updated");
        emit StatusChanged(id, old, newStatus, msg.sender, block.timestamp);
    }

    /**
     * @notice Escalate a complaint (admin or auto after threshold)
     * @param id Complaint ID
     */
    function escalateComplaint(uint256 id)
        external
        complaintExists(id)
    {
        Complaint storage c = _complaints[id];

        bool isAdminCall = (_roles[msg.sender] == Role.Admin || msg.sender == contractOwner);
        bool isAutoEligible = (
            block.timestamp >= c.createdAt + ESCALATION_THRESHOLD &&
            c.status != Status.Resolved &&
            c.status != Status.Closed
        );

        if (!isAdminCall && !isAutoEligible)
            revert UnauthorizedAccess(msg.sender, "Cannot escalate");

        c.status = Status.Escalated;
        c.escalatedAt = block.timestamp;
        c.updatedAt = block.timestamp;

        _appendTimeline(id, Status.Escalated, msg.sender, "Complaint escalated");
        emit ComplaintEscalated(id, msg.sender, block.timestamp);
        emit StatusChanged(id, c.status, Status.Escalated, msg.sender, block.timestamp);
    }

    /**
     * @notice Reopen a closed/resolved complaint
     * @param id Complaint ID
     * @param reason Explanation for reopening
     */
    function reopenComplaint(uint256 id, string calldata reason)
        external
        complaintExists(id)
    {
        Complaint storage c = _complaints[id];

        bool isOwner = (!c.isAnonymous && c.owner == msg.sender);
        bool isAdmin = (_roles[msg.sender] == Role.Admin || msg.sender == contractOwner);

        if (!isOwner && !isAdmin)
            revert UnauthorizedAccess(msg.sender, "Not complaint owner or admin");

        if (c.status != Status.Resolved && c.status != Status.Closed)
            revert InvalidStatusTransition(c.status, Status.Reopened);

        Status old = c.status;
        c.status = Status.Reopened;
        c.updatedAt = block.timestamp;
        c.feedbackSubmitted = false;

        _appendTimeline(id, Status.Reopened, msg.sender, reason);
        emit ComplaintReopened(id, msg.sender, reason, block.timestamp);
        emit StatusChanged(id, old, Status.Reopened, msg.sender, block.timestamp);
    }

    /**
     * @notice Add admin notes to a complaint
     * @param id Complaint ID
     * @param note The note text
     */
    function addAdminNote(uint256 id, string calldata note)
        external
        onlyAdmin
        complaintExists(id)
    {
        _complaints[id].adminNotes = note;
        _complaints[id].updatedAt = block.timestamp;
        emit AdminNoteAdded(id, msg.sender, note, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  VOTING
    // ─────────────────────────────────────────────

    /**
     * @notice Cast a vote of support for a complaint
     * @param id Complaint ID
     */
    function voteComplaint(uint256 id)
        external
        complaintExists(id)
    {
        if (_votes[id][msg.sender])
            revert DuplicateVote(msg.sender, id);

        _votes[id][msg.sender] = true;
        _complaints[id].voteCount++;
        _complaints[id].updatedAt = block.timestamp;

        emit ComplaintVoted(id, msg.sender, _complaints[id].voteCount, block.timestamp);
    }

    /**
     * @notice Check if a wallet has voted on a complaint
     * @param id Complaint ID
     * @param voter Wallet to check
     * @return bool
     */
    function hasVoted(uint256 id, address voter) external view returns (bool) {
        return _votes[id][voter];
    }

    // ─────────────────────────────────────────────
    //  FEEDBACK & RATING
    // ─────────────────────────────────────────────

    /**
     * @notice Submit feedback after complaint is resolved
     * @param id Complaint ID
     * @param rating Star rating 1–5
     * @param comment Optional text feedback
     */
    function submitFeedback(uint256 id, uint8 rating, string calldata comment)
        external
        complaintExists(id)
    {
        Complaint storage c = _complaints[id];

        if (c.status != Status.Resolved && c.status != Status.Closed)
            revert ComplaintNotResolved(id);

        if (c.feedbackSubmitted)
            revert FeedbackAlreadySubmitted(id);

        if (rating < 1 || rating > 5)
            revert InvalidRating(rating);

        bool isOwner = (!c.isAnonymous && c.owner == msg.sender);
        if (!isOwner)
            revert UnauthorizedAccess(msg.sender, "Not complaint owner");

        _feedbacks[id] = Feedback({
            student: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            exists: true
        });

        c.feedbackSubmitted = true;
        c.updatedAt = block.timestamp;

        emit FeedbackAdded(id, msg.sender, rating, block.timestamp);
    }

    /**
     * @notice Get feedback for a resolved complaint
     * @param id Complaint ID
     * @return Feedback struct
     */
    function getFeedback(uint256 id)
        external
        view
        complaintExists(id)
        returns (Feedback memory)
    {
        return _feedbacks[id];
    }

    // ─────────────────────────────────────────────
    //  READ FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @notice Retrieve a complaint by ID
     * @dev Hides owner address for anonymous complaints unless admin
     * @param id Complaint ID
     * @return Complaint struct
     */
    function getComplaint(uint256 id)
        external
        view
        complaintExists(id)
        returns (Complaint memory)
    {
        Complaint memory c = _complaints[id];
        bool isAdmin = (_roles[msg.sender] == Role.Admin || msg.sender == contractOwner);
        if (c.isAnonymous && !isAdmin) {
            c.owner = address(0);
        }
        return c;
    }

    /**
     * @notice Get all complaint IDs filed by caller
     * @return uint256[] array of IDs
     */
    function getComplaintsByUser() external view returns (uint256[] memory) {
        return _userComplaints[msg.sender];
    }

    /**
     * @notice Get all complaint IDs (admin only)
     * @return uint256[] array of all IDs
     */
    function getAllComplaints() external view onlyAdmin returns (uint256[] memory) {
        return _allComplaintIds;
    }

    /**
     * @notice Get full timeline for a complaint
     * @param id Complaint ID
     * @return TimelineEntry[] array
     */
    function getTimeline(uint256 id)
        external
        view
        complaintExists(id)
        returns (TimelineEntry[] memory)
    {
        return _timelines[id];
    }

    /**
     * @notice Total number of complaints ever submitted
     * @return uint256 count
     */
    function totalComplaints() external view returns (uint256) {
        return _complaintCounter;
    }

    // ─────────────────────────────────────────────
    //  INTERNAL HELPERS
    // ─────────────────────────────────────────────

    /// @dev Append a timeline entry for a complaint
    function _appendTimeline(
        uint256 id,
        Status status,
        address actor,
        string memory note
    ) internal {
        _timelines[id].push(TimelineEntry({
            timestamp: block.timestamp,
            status: status,
            actor: actor,
            note: note
        }));
    }

    /// @dev Automatically resolve the responsible officer by category
    function _autoAssign(Category category) internal view returns (address) {
        // In production these would be stored in a mapping;
        // returning address(0) means admin must manually assign
        // unless officers register themselves per category.
        // The auto-assign logic is exposed to the frontend through events.
        return address(0); // frontend calls assignComplaint() after officer registration
    }

    /// @dev Validate that a status transition is legal
    function _validateTransition(Status current, Status next) internal pure {
        if (current == Status.Closed && next != Status.Reopened)
            revert InvalidStatusTransition(current, next);
        if (current == Status.Resolved && next == Status.Pending)
            revert InvalidStatusTransition(current, next);
    }
}
