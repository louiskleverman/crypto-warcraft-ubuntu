pragma solidity ^0.4.24;

//import "./Ownable.sol";

import "./EIP20.sol";
import "./WarcraftCoin.sol";

contract Warcraft is WarcraftCoin{

    struct Character{
        string name;
        //The Dna of this iteration is pretty simple and allows to just put the basics out. It will have more characteristics in the future.
        uint dna;
        uint8 lvl;
        uint exp;
        //Ready is for specifying when the character is ready to take action
        uint ready;
        //not needed when I remember the non-recursive mathematical expression
        uint toNextLvl;
    }  
    /*
     * @variable Number of traits 
     * Race
     * Gender
     * Class
     * Special trait
     */
    uint internal dnaSize = 4;
    uint public baseExp = 100;
    uint public maxLevel = 50;
    uint public randNonce = 0; 
    // next level is expRate% more then previous
    uint internal expRate = 20;
    // the cost in warcraftCoins to buy a new character
    uint public newRandomCharacterCost = 2;
    
    Character[] public characters;
    
    mapping(uint => address) public characterToOwner;
    mapping(address => uint) public characterCount;
    
    event characterCreated(address _address,uint _charId,string _name,uint _dna);
    
    modifier onlyCharacterOwner(uint _id){
        require(msg.sender == characterToOwner[_id],"You are not the owner of this character");
        _;
    }

    modifier onlyUnderMaxLevel(uint _charId){
        require(characters[_charId].lvl < maxLevel, "The character can't do this because he's max level");
        _;
    }

    modifier checkNameSize(string _name){
        require(bytes(_name).length <= 30,"Name length too long!");
        _;
    }
    
    modifier isReady(uint _id){
        require(characters[_id].ready <= now, "Character not ready yet!");
        _;
    }
    
    /** @dev Creates a character.
      * @param _name Name of the character.
      * @param _dna The Dna of the character.
      * @param _faction The faction of the character. Alliance false and Horde true.
      * @dev dna passed into function to allow special functions that can create specific characters.
      * @return _id the id of the newly created char.
      */
    function createCharacter(string _name,uint _dna,bool _faction) internal checkNameSize(_name) whenNotPaused() returns(uint _id){
        uint dna = _dna;
        if(_faction){
            dna = dna*10 + 1;
        }
        else{
            dna = dna*10;
        }
        uint id = characters.push(Character(_name,dna,1,0,uint(now),baseExp));
        characterToOwner[id-1] = msg.sender;
        characterCount[msg.sender]++;
        
        emit characterCreated(msg.sender,id-1,_name,dna);
        return id-1;
    } 
    
    /** @dev "Creates" the account by creating the address' first character.
      * @param _name Name of the character.
      * @param _faction The faction of the character. Alliance false and Horde true.
      * @return _id the id of the newly created char.
      */
    function createAccount(string _name,bool _faction) public checkNameSize(_name) whenNotPaused() returns(uint _id){
        require(characterCount[msg.sender] == 0,"Not a new account, already got a character to this addresss");
        uint rand = uint(keccak256(_name,msg.sender));
        uint dna = rand % (10**dnaSize);
        
        return createCharacter(_name,dna,_faction);
    }

    /** @dev create new character.Only available if the user already has a character. 
      * @param _name Name of the character.
      * @param _faction The faction of the character. Alliance false and Horde true.
      * @return _id the id of the newly created char.
      * @dev It is currently in Ether and will later cost a token amount
      */
    function createNewRandomCharacter(string _name, bool _faction) public checkNameSize(_name) whenNotPaused() returns(uint _id){
        require(characterCount[msg.sender] >= 0,"This account hasn't had his free character yet!");
        require(balanceOf(msg.sender) >= newRandomCharacterCost, "You don't have enough warcraftCoins to purchase");
        
        purchase(newRandomCharacterCost);
        uint rand = uint(keccak256(_name,msg.sender));
        uint dna = rand % (10**dnaSize);

        return createCharacter(_name,dna,_faction);
    }
    
    /** @dev Gets the charcater information.
      * @param _id Id of the character.
      * @return name : Character's name.
      * @return dna : Character's dna.
      * @return lvl : Character's level.
      * @return exp : Character's experience.
      * @return toNextLvl : Character's required exp to get to the next level.
      * @return ready : Character's time at which he is ready to make another action.
      */
    function getCharacter(uint _id) public view returns(uint id,string name, uint dna, uint lvl, uint exp,uint toNextLvl,uint ready){
        Character memory c = characters[_id];
        return(_id,c.name,c.dna,c.lvl,c.exp,c.toNextLvl,c.ready);
    }

    /** @dev Gets the _owner's characters. used to get current users characters and will be used in future implementations
      * @param _owner The Owner of whome we want to get the characters.
      * @return uint[] : Array containing the id's of the owner's characters.
      */
    function getCharacters(address _owner) public view returns(uint[]){
        uint[] memory chars = new uint[](characterCount[_owner]);
        uint counter;
        for(uint i = 0 ; i < characters.length ; i++){
            if(characterToOwner[i] == _owner){
                chars[counter++] = i;
            }
        }
        return chars;
    }

    /** @dev Change the cost of making a new random character
      * @param _newCost The new cost of the new random character.
      */
    function changeNewRandomCharacterCost(uint _newCost) public whenPaused() onlyOwner(){
        //Check for unecissary spending of gas
        require(newRandomCharacterCost != _newCost,"You are trying to set the new cost to what it already was");
        newRandomCharacterCost = _newCost;
    }

    /** @dev Change the maximum level of a character
      * @param _newMaxLevel The new maximum level.
      */
    function changeMaxLevel(uint8 _newMaxLevel) public whenPaused() onlyOwner(){
        //Check for unecissary spending of gas
        require(maxLevel != _newMaxLevel,"You are trying to set the new maxLevel to what it already was");
        maxLevel = _newMaxLevel;
    }

    /** 
      *  @dev Destroys contract and sends funds to owner
      */
    function kill() public onlyOwner(){
        selfdestruct(owner);
    }

    /** @dev Returns the amount of characters in the game.
      * @return length : the amount of characters.
      */
    function getCharacterCount() public returns(uint){
        return characters.length;
    }
}
