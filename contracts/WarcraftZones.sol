pragma solidity ^0.4.24;
import "./Warcraft.sol";

contract WarcraftZones is Warcraft{
    
    Zone[] zones;
    uint public zoneDowntime = 60 seconds;
    
    struct Zone{
        string name;
        uint8 lvlRequirement;
        // The success rate is always under 100%
        uint8 successRate;
        uint64 exp;
        //continent : 0 => Kalimdor, 1 => Eastern kingdoms
        uint8 continent;
        // cryptoCoin reward, since 2^64 should be enough of a reward, maybe even too much
        uint64 currencyReward;
    } 

    /** @dev Indicates when quest has been done.
    * @param _success returns weather or not the quest succeeded.
    * @param _charId Id of the character doing the quest.
    * @param _questId Id of the quest being quested.
    */
    event questDone(bool _success,uint _charId,uint _questId);


    /** @dev The contract's constructor. Generates the zones for the game.
      */
    constructor() public{
        zones.push(Zone("Durotar",1,100,100,0,1));
        zones.push(Zone("Elwynn Forest",1,100,100,1,1));
        zones.push(Zone("Barrens",5,90,140,0,2));
        zones.push(Zone("Loch Modan",5,90,140,1,2));
        zones.push(Zone("Stonetalon Mountains",10,80,220,0,3));
        zones.push(Zone("Redridge Mountains",10,80,220,1,3));
        zones.push(Zone("Ashenvale",15,60,500,0,4));
        zones.push(Zone("Duskwood",15,60,500,1,4));
    }
    
    /** @dev Function handling the gain of experience of a character.
      * @param _charId The character gaining the experience.
      * @param _exp The amount of experience the character is gaining.
      */
    function getExp(uint _charId,uint _exp) internal whenNotPaused() onlyUnderMaxLevel(_charId){
        Character storage char = characters[_charId];
        char.exp += _exp;
        if(char.exp >= char.toNextLvl){
            char.lvl++;
            if(char.lvl == maxLevel)
                char.exp = 0;
            else
                char.exp -= char.toNextLvl;
            char.toNextLvl += char.toNextLvl*expRate/100;
        }
    }
    
    /** @dev Makes the character(_charId) quest in a zone.
      * @param _charId The character doing the quest.
      * @param _zoneId The Id of the zone the character will quest in.
      * @return bool : Returns the success of the quest.
      */
    function questing(uint _charId, uint _zoneId) public onlyCharacterOwner(_charId) isReady(_charId) whenNotPaused() returns(bool){
        Zone memory zone = zones[_zoneId];
        require(characters[_charId].lvl >= zone.lvlRequirement, "The character does not have the level requirement");
        uint rand = uint(keccak256(randNonce++,msg.sender))%100;
        bool success = false;
        if(rand <= zone.successRate){
            getExp(_charId,zone.exp);
            success = true;
            giveToken(msg.sender,zone.currencyReward);
        }
        characters[_charId].ready = now + zoneDowntime;
        emit questDone(success,_charId,_zoneId);
        return success;
    }

    /** @dev Get's the zone's information.
      * @param _id The zone's Id.
      * @return id : the zone's Id.
      * @return name : the zone's name.
      * @return lvlReq : the level required to quest in the zone.
      * @return successRate : the zone's success rate.
      * @return exp : the experience gained when questing in the zone.
      * @return _continent : the quest's continent location.
      * @return _currencyReward : the quest's reward.
      */
    function getZone(uint _id) public view returns(
    uint id,string name,uint lvlReq,uint successRate,uint exp,uint continent, uint currencyReward){
        Zone memory zone = zones[_id];
        return (_id,zone.name,zone.lvlRequirement,zone.successRate,zone.exp,zone.continent,zone.currencyReward);
    }

    /** @dev Returns the amount of zones in the game.
      * @return length : the amount of zones.
      */
    function getZoneCount() public view returns(uint length){
        return zones.length;
    }

    /** @dev Adds a new zone to the game. (ONLY OWNER)
      * @param _name : the zone's name.
      * @param _lvlReq : the level required to quest in the zone.
      * @param _successRate : the zone's success rate.
      * @param _exp : the experience gained when questing in the zone.
      * @param _continent : the quest's continent location.
      * @param _currencyReward : the quest's reward.
      */
    function addNewZone(string _name, uint8 _lvlReq, uint8 _successRate, uint64 _exp, uint8 _continent, uint64 _currencyReward) 
    public onlyOwner() whenPaused() checkNameSize(_name){
        require(_successRate <= 100,"The success rate is over 100");
        zones.push(Zone(_name,_lvlReq,_successRate,_exp,_continent,_currencyReward));
    }

    /** @dev Changes the zones donwtime (ONLY OWNER)
      * @param _newZoneDowntime : the  new zone downtime.
      */
    function changeZoneDowntime(uint _newZoneDowntime) public onlyOwner() whenPaused(){
        require(_newZoneDowntime >= 0, "Zone downtime must be over or equal to 0");
        zoneDowntime = _newZoneDowntime;
    }
}