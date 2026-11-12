// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Social {
    // ids start at 1, so replyTo == 0 means "not a reply"
    uint256 public nextPostId = 1;

    mapping(string => address) public handleOwner;
    mapping(address => string) public handleOf;
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    event ProfileSet(address indexed user, string handle, string metadataCID);
    event Posted(uint256 indexed id, address indexed author, string contentCID, uint256 replyTo);
    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);
    event Liked(address indexed user, uint256 indexed postId);
    event Unliked(address indexed user, uint256 indexed postId);

    function setProfile(string calldata handle, string calldata metadataCID) external {
        require(bytes(handle).length > 0, "Handle required");
        require(bytes(handle).length <= 20, "Handle too long");
        address owner = handleOwner[handle];
        require(owner == address(0) || owner == msg.sender, "Handle taken");

        string memory old = handleOf[msg.sender];
        if (bytes(old).length > 0 && keccak256(bytes(old)) != keccak256(bytes(handle))) {
            delete handleOwner[old];
        }

        handleOwner[handle] = msg.sender;
        handleOf[msg.sender] = handle;
        emit ProfileSet(msg.sender, handle, metadataCID);
    }

    // replyTo = 0 for a normal post, or the id of the post you're replying to
    function post(string calldata contentCID, uint256 replyTo) external returns (uint256 id) {
        require(bytes(handleOf[msg.sender]).length > 0, "Create a profile first");
        require(bytes(contentCID).length > 0, "Empty content");
        require(replyTo < nextPostId, "Parent post does not exist");
        id = nextPostId++;
        emit Posted(id, msg.sender, contentCID, replyTo);
    }

    function follow(address user) external {
        require(user != msg.sender, "Cannot follow yourself");
        require(!isFollowing[msg.sender][user], "Already following");
        isFollowing[msg.sender][user] = true;
        emit Followed(msg.sender, user);
    }

    function unfollow(address user) external {
        require(isFollowing[msg.sender][user], "Not following");
        isFollowing[msg.sender][user] = false;
        emit Unfollowed(msg.sender, user);
    }

    function like(uint256 postId) external {
        require(postId > 0 && postId < nextPostId, "Post does not exist");
        require(!hasLiked[postId][msg.sender], "Already liked");
        hasLiked[postId][msg.sender] = true;
        emit Liked(msg.sender, postId);
    }

    function unlike(uint256 postId) external {
        require(hasLiked[postId][msg.sender], "Not liked");
        hasLiked[postId][msg.sender] = false;
        emit Unliked(msg.sender, postId);
    }
}
