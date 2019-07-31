pragma solidity ^0.5.0;

contract Daedalus {
    uint public exchangeEndTime;
    uint public energyAmount;

    address supplier;

    mapping(address=>bool) bidder;

    bool exchangeCompleted;

    address highestBidder;
    uint highestBid;

    constructor(uint _bidTime, uint _energyAmount) public {
        supplier = msg.sender;
        exchangeEndTime = now + _bidTime;
        energyAmount = _energyAmount;
    }

    function bid() public payable {
        require(now <= exchangeEndTime, "Exchange has already ended");
        require(msg.value > highestBid, "Your bid does not exceed the current highest bid");
    }
}