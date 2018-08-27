pragma solidity ^0.4.18;

import "../contracts/WarcraftCoin.sol";
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract TestWarcraftCoin{
    WarcraftCoin warcraftCoin;

    function testCorrectDeploymentOwner() public{

        warcraftCoin = new WarcraftCoin();
        address expected = address(warcraftCoin);
        
        address got = address(warcraftCoin.owner);

        Assert.equal(got, expected, "The address is supposed to be the caller : ");
    }
    function testCorrectDeploymentAmount() public{
        uint expected = 10000000000000;
        
        uint got = warcraftCoin.getBalanceOf(address(this));

        Assert.equal(got, expected, "Not the right quantity");
    }
    function testBalanceBeforeGiving() public{
        address a = address(warcraftCoin);
        uint expected = 0;
        
        uint got = warcraftCoin.getBalanceOf(a);

        Assert.equal(got, expected, "Not the right quantity");
    }
    function testGiveToken() public{
        warcraftCoin.giveToken(address(warcraftCoin),50);
        uint expected = 50;
        
        uint got = warcraftCoin.getBalanceOf(warcraftCoin);

        Assert.equal(got, expected, "Not the right quantity");
    }

    function testCorrectBalanceAfterGive() public{
        uint expected = 10000000000000 - 50;
        
        uint got = warcraftCoin.getBalanceOf(this);

        Assert.equal(got, expected, "Not the right quantity");
    }

}