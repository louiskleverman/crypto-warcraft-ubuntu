pragma solidity ^0.4.18;


import "../contracts/WarcraftZones.sol";
import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
contract TestWarcraftZone{
    WarcraftZones warcraftZones = new WarcraftZones();
    uint charId;
    uint id;
    string name;
    uint dna;
    uint lvl;
    uint exp;
    uint toNextLvl;
    uint ready;
    function beforeAll() public{
        charId = warcraftZones.createAccount("test",false);
    }
    function beforeEach() public{
        (id,name,dna,lvl,exp,toNextLvl,ready) = warcraftZones.getCharacter(0);
    }

    function testgetZoneCount() public{
        uint expected = 8;
        
        uint got = warcraftZones.getZoneCount();

        Assert.equal(got, expected, "There are supposed to be 8 zones");
    }

    function testQuesting() public{
        bool expected = true;
        bool got = warcraftZones.questing(charId,0);

        Assert.equal(got, expected, "The character is supposed to succeed");
    }
    function testQuestingResultsLvl() public{
        uint expected = 2;
        uint got = lvl;

        Assert.equal(got, expected, "The character is supposed to be lvl 2");
    }
    function testQuestingResultsExp() public{
        uint expected = 0;
        uint got = 0;

        Assert.equal(got, expected, "The character is supposed to have everything");
    }
    function testQuestingResultsToggledReady() public{
        bool expected = false;
        bool got = ready <= now;

        Assert.equal(got, expected, "The character is supposed to not be ready");
    }
    function testQuestingResultsToNextLvl() public{
        uint expected = 120;
        uint got = toNextLvl;

        Assert.equal(got, expected, "The character is supposed to need 120 exp to next level");
    }
}