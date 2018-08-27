pragma solidity ^0.4.18;

//import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EIP20.sol";
//Pausable imports ownable
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract WarcraftCoin is EIP20,Pausable{
//  initial amount : 10 000 000 000 000
    constructor() EIP20(10000000000000,"WarcraftCoin",18,"WCC") Ownable() public{

    }
    function giveToken(address _to, uint _value) internal whenNotPaused() returns(bool){
        require(balanceOf(owner) - _value >= 0 && 
            balances[_to] + _value >= balances[_to] && 
            balances[owner] - _value <= balances[owner],
            "Owner's balance will be < 0 if you continue this operation");
        balances[owner] -= _value;
        balances[_to] += _value;
        emit Transfer(owner, msg.sender, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }
    function getBalanceOf(address _address) public view returns(uint){
        return balanceOf(_address);
    }
    function purchase(uint256 _value) public whenNotPaused() returns(bool){
        return transfer(owner,_value);
    }
}