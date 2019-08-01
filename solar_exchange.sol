pragma solidity ^0.5.0;

contract daedalusEnergy {
    uint public bidTime;
    uint public energyAmount;
    uint public minBidAmount;
    uint public minBidIncrAmount;
    address payable bidder;
    bool completed;
    uint bidsCount;
    uint minStartBid;
    uint currentBid;
    uint surplusId;
    uint finalBidAmount;
    bool bidApproved;
    address highestBidder;
    address supplier;
    mapping(address=>uint) public bids;
    mapping(address=>bool) public accounts;

    constructor(uint _bidTime, uint _energyAmount, uint _minBidAmount, uint _minBidIncrAmount) public {
        bidTime = _bidTime;
        energyAmount = _energyAmount;
        minBidAmount = _minBidAmount;
        minBidIncrAmount = _minBidIncrAmount;
    }

    struct surplus {
        bool bidApproved;
        address highestBidder;
        address supplier;
        uint energyAmount;
        uint highestBid;
        uint bidsCount;
        uint bidsTime;
        uint minBidAmount;
        uint minBidIncrAmount;
    }

    function createSurplus() public {
        surplus newSurplus = surplus(
            {bidApproved: false,
            highestBidder:2,
            supplier: address,
            energyAmount : 2,
            highestBid : 10,
            bidsCount: 3,
            bidsTime: 13,
            minBidAmount : 0,
            minBidIncrAmount : 3
            });
    }

    function bid(uint _maxBidAmount) public{
        require(!accounts[msg.sender], 'Bidder exists.');
        require(!accounts[supplier], 'Recipient exists.');
        require(bids[msg.sender] > currentBid && bids[msg.sender] > minStartBid,
        'Bid is greater than current bid and greater than the minimum start bid');
    }


    function finalizeBid(uint _surplusId) public payable {
        bidder.transfer(msg.value);
        accounts[supplier] += msg.value;
    }

}