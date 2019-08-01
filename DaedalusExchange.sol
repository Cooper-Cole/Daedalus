pragma solidity ^0.5.0;

contract DaedalusExchange {
    uint public exchangeEndTime;
    uint public energyAmount;

    address payable public supplier;

    mapping(address => bool) bidder;
    mapping(address => uint) pendingReturns;

    bool exchangeCompleted;

    event HighestBidIncreased(address bidder, uint amount);
    event ExchangeEnded(address winner, uint amount);

    address public highestBidder;
    uint public highestBid;

    constructor(uint _bidTime, uint _energyAmount) public {
        supplier = msg.sender;
        exchangeEndTime = now + _bidTime;
        energyAmount = _energyAmount;
    }

    function bid() public payable {
        require(now <= exchangeEndTime, "Exchange has already ended");
        require(msg.value > highestBid, "Your bid does not exceed the current highest bid"); // this asserts the current bid is the new highest
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid; // make note of what the previous highest bidder bid
        }

        highestBidder = msg.sender;
        highestBid = msg.value;

        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint amnt = pendingReturns[msg.sender];

        if (amnt > 0) {
            pendingReturns[msg.sender] = 0;
            if (!msg.sender.send(amnt)) {
                pendingReturns[msg.sender] = amnt;
                return false;
            }
        }

        return true;
    }

    function exchangeEnd() public {
        require(now >= exchangeEndTime, "Exchange not yet ended");
        require(!exchangeCompleted, "Exchange has already been completed");

        exchangeCompleted = true;
        emit ExchangeEnded(highestBidder, highestBid);

        supplier.transfer(highestBid);
    }
}