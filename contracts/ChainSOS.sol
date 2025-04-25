// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ChainSOS
 * @dev Main contract for the ChainSOS emergency response system
 */
contract ChainSOS is ERC721, Ownable {
    using Counters for Counters.Counter;

    struct SOSAlert {
        uint256 id;
        address sender;
        int256 longitude;
        int256 latitude;
        uint256 timestamp;
        bool isActive;
        address responder;
        uint256 responseTime;
    }

    struct Responder {
        bool isVerified;
        uint256 responseCount;
        uint256 averageResponseTime;
        uint256 reputationScore;
    }

    Counters.Counter private _alertIds;
    Counters.Counter private _tokenIds;

    mapping(uint256 => SOSAlert) public alerts;
    mapping(address => Responder) public responders;
    mapping(address => uint256[]) public userAlerts;
    mapping(address => uint256[]) public responderAlerts;

    uint256 public constant MINIMUM_STAKE = 0.1 ether;
    uint256 public constant RESPONSE_TIMEOUT = 30 minutes;

    event AlertCreated(uint256 indexed alertId, address indexed sender, int256 longitude, int256 latitude);
    event AlertResolved(uint256 indexed alertId, address indexed responder, uint256 responseTime);
    event ResponderVerified(address indexed responder);
    event ResponderStaked(address indexed responder, uint256 amount);

    constructor() ERC721("ChainSOS Responder Badge", "CSOS") Ownable(msg.sender) {}

    /**
     * @dev Send an SOS alert
     * @param longitude The longitude coordinate (multiplied by 1e18)
     * @param latitude The latitude coordinate (multiplied by 1e18)
     */
    function sendSOS(int256 longitude, int256 latitude) external payable {
        require(msg.value >= 0.01 ether, "Minimum fee required to prevent spam");
        
        uint256 alertId = _alertIds.current();
        _alertIds.increment();

        alerts[alertId] = SOSAlert({
            id: alertId,
            sender: msg.sender,
            longitude: longitude,
            latitude: latitude,
            timestamp: block.timestamp,
            isActive: true,
            responder: address(0),
            responseTime: 0
        });

        userAlerts[msg.sender].push(alertId);
        emit AlertCreated(alertId, msg.sender, longitude, latitude);
    }

    /**
     * @dev Respond to an active SOS alert
     * @param alertId The ID of the alert to respond to
     */
    function respondToAlert(uint256 alertId) external {
        require(responders[msg.sender].isVerified, "Only verified responders can respond");
        require(alerts[alertId].isActive, "Alert is not active");
        require(alerts[alertId].responder == address(0), "Alert already has a responder");

        alerts[alertId].responder = msg.sender;
        alerts[alertId].responseTime = block.timestamp - alerts[alertId].timestamp;
        responderAlerts[msg.sender].push(alertId);

        // Update responder stats
        Responder storage responder = responders[msg.sender];
        responder.responseCount++;
        responder.averageResponseTime = (responder.averageResponseTime * (responder.responseCount - 1) + 
            alerts[alertId].responseTime) / responder.responseCount;

        emit AlertResolved(alertId, msg.sender, alerts[alertId].responseTime);

        // Mint reward NFT if response time is good
        if (alerts[alertId].responseTime < RESPONSE_TIMEOUT) {
            _mintRewardNFT(msg.sender);
        }
    }

    /**
     * @dev Register as a responder by staking
     */
    function registerAsResponder() external payable {
        require(msg.value >= MINIMUM_STAKE, "Insufficient stake");
        require(!responders[msg.sender].isVerified, "Already registered");

        responders[msg.sender] = Responder({
            isVerified: true,
            responseCount: 0,
            averageResponseTime: 0,
            reputationScore: 100
        });

        emit ResponderVerified(msg.sender);
        emit ResponderStaked(msg.sender, msg.value);
    }

    /**
     * @dev Mint a reward NFT for good response time
     * @param responder The address of the responder
     */
    function _mintRewardNFT(address responder) internal {
        uint256 newTokenId = _tokenIds.current();
        _tokenIds.increment();
        _safeMint(responder, newTokenId);
    }

    /**
     * @dev Get all active alerts
     * @return Array of active alert IDs
     */
    function getActiveAlerts() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < _alertIds.current(); i++) {
            if (alerts[i].isActive) {
                count++;
            }
        }

        uint256[] memory activeAlerts = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < _alertIds.current(); i++) {
            if (alerts[i].isActive) {
                activeAlerts[index] = i;
                index++;
            }
        }

        return activeAlerts;
    }

    /**
     * @dev Get responder details
     * @param responder The address of the responder
     * @return isVerified, responseCount, averageResponseTime, reputationScore
     */
    function getResponderDetails(address responder) external view returns (
        bool, uint256, uint256, uint256
    ) {
        Responder memory r = responders[responder];
        return (r.isVerified, r.responseCount, r.averageResponseTime, r.reputationScore);
    }
} 