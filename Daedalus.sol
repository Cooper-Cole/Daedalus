pragma solidity ^0.5.0;

contract Daedalus {

  address[] public surplusContracts;

/* creating event that sends out address */
  event SurplusCreated (
    address _surplusAddress
  );

  function newSurplus(uint energyAmount) public payable returns (address) {
      Surplus s = new Surplus(msg.sender, energyAmount);
      surplusContracts.push(address(s));
      emit SurplusCreated(address(s));
      return address(s);
  }

}

contract Surplus {
    uint public energyAmount;

    address payable public supplier;

    mapping(address => bool) bidder;
    mapping(address => uint) pendingReturns;

    bool exchangeCompleted;

    event HighestBidIncreased(address bidder, uint amount);
    event ExchangeEnded(address winner, uint amount);

    address public highestBidder;
    uint public highestBid;

    constructor(address payable _supplier, uint _energyAmount) public {
        supplier = _supplier;
        energyAmount = _energyAmount;
    }

    function bid() public payable {
        require(!exchangeCompleted, "Exchange has already ended");
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

            msg.sender.transfer(amnt);
        }

        return true;
    }

    function exchangeEnd() public payable {
        require(!exchangeCompleted, "Exchange has already been completed");

        exchangeCompleted = true;
        emit ExchangeEnded(highestBidder, highestBid);

        supplier.transfer(highestBid);
    }
}
