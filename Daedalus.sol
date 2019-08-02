pragma solidity ^0.5.0;

contract Daedalus {

  address[] public surplusContracts;

/* creating event that sends out address */
  event SurplusCreated (
    address indexed _surplusAddress
  );

  function newSurplus(string memory surplusName) public payable returns (address) {
      Surplus s = new Surplus(surplusName);
      surplusContracts.push(address(s));
      emit SurplusCreated(address(s));
      return address(s);
  }

}

contract Surplus {
  string public name;

  constructor (string memory _name) public {
    name = _name;
  }

  /* event when new contract is created, wants daedalus to broadcast
  address of surplus  */
}
