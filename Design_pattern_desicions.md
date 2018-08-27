# Design pattern decisions

## Implemented design patterns

### Fail safe fail loud

When there are cases where the function cannot work if there is a condition, the addition of a require in the begining of that function has been added to fail directly.

### OnlyOwner

The game has an owner, which has the possiblity to access and use functions that can affect the contracts overall state.

### OnlyCharacterOwner

This design pattern allows certain functions to be used only by the owner of the account/character. This allows the player to be the only one being able to play his account/player and affect his gameplay himself.

### Selfdestruct

The selfdestruct design pattern allows the owner of the contract to terminate it if needed. (for example if deployed on a test chain and found a bug, could terminate the game and launch a new one at a new addresss).

### Pausable (Identical to Emergency stop but open-zeppelin's version)

The pausable design pattern allows functions to only be used when the game isn't on pause (practically all the time) that affect the state of the contract that needed to be paused to fix.

It also allows certain changes to the state safely without encountering any TOD's.

## Implementation idea's

### Owner can't

Since the owner has so much power, it would it be unfair for him to play the game, so maybe implementing the fact that the owner can't play the game.

