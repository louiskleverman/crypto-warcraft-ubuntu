pragma solidity ^0.4.18;

import "../contracts/Warcraft.sol";
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract TestWarcraft{
    Warcraft warcraft = new Warcraft();

    function testCreateAccount() public{
        uint expected = 0;
        uint got = warcraft.createAccount("test",false);
       
        Assert.equal(got, expected, "Id is supposed to be 0");
    }
    function testCreateAccountCount() public{
        uint expected = 1;
        uint got = warcraft.getCharacters(this).length;
       
        Assert.equal(got, expected, "Supposed to be 1 char");
    }
    function testCreateAccountId() public{
        uint expected = 0;
        uint got = warcraft.getCharacters(this)[0];
       
        Assert.equal(got, expected, "Id is supposed to be 0");
    }
    function testCreateAccountName() public{
        string memory expected = "test";
        string memory got;
        (,got,,,,,) = warcraft.getCharacter(0);
       
        Assert.equal(got, expected, "Name is supposed to be test");
    }

    function testCreateNewRandomCharacter() public{
        uint expected = 1;
        uint got;
        got = warcraft.createNewRandomCharacter("toto",true);
       
        Assert.equal(got, expected, "Id is supposed to be 1");
    }
    
    function testNewCharacterCount() public{
        uint expected = 2;
        uint got = warcraft.getCharacters(this).length;
       
        Assert.equal(got, expected, "Supposed to be 2 characters");
    }

    function testNewCharacterId() public{
        uint expected = 1;
        uint got = warcraft.getCharacters(this)[1];
       
        Assert.equal(got, expected, "Id is supposed to be 1");
    }

    function testNewCharacterName() public{
        string memory expected = "toto";
        string memory got;
        (,got,,,,,) = warcraft.getCharacter(1);
       
        Assert.equal(got, expected, "Name is supposed to be toto");
    }

}