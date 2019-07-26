pragma solidity ^0.5.0;

contract daedalusEnergy {
    uint public bidTime;
    uint public energyAmount;
    uint public minBidAmount;
    uint public minBidIncrAmount;
    address supplier;
    mapping(address=>bool) bidder;
    bool completed;
    address highestBidder;
    uint bidsCount;
    uint minStartBid;

    constructor(uint _bidTime, uint _energyAmount, uint _minBidAmount, uint _minBidIncrAmount) public {
        bidTime = _bidTime;
        energyAmount = _energyAmount;
        minBidAmount = _minBidAmount;
        minBidIncrAmount = _minBidIncrAmount;
    }

    function bid(uint _maxBidAmount) public payable {
        /* Requires bidder address verified, supplier address verified, minBid met */
        require(bidder[msg.sender], 'Bidder does not exist!');
        require(bidder[supplier], 'Supplier does not exist!');
        require(bid[msg.sender] >= msg.value, 'Bid must be at minimum');

        bidder.bid(msg.value);

    }
}