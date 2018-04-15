pragma solidity ^0.4.20;

contract SimpleStore {

    event ValueChanged(address indexed author, string oldValue, string newValue);

    string _value = "First!!1";

    function setValue(string value) public {
        ValueChanged(msg.sender, _value, value);
        _value = value;
    }

    function value() public constant returns (string) {
        return _value;
    }

}
