# Crypto Warcraft README

## What is Crypto Warcraft ?

**crypto warcraft** is an ethereum based game, similar to cryptokitties or cryptoZombies but with different functionalities and in the warcraft universe. 

## How to set it up.

### Requirements

#### MetaMask

You will need MetaMask or another Web3 injector in order to use the website created. I haven't tested the project with other web3 injecters so I advise using MetaMask.

#### Ganache-Cli or Ganache

You will need ganache to run a local blockchain to run the game on. You can either use the ganache-cli or the ganache client to play the game.

## Versions
I have initially made the project on windows 10 and on ubuntu 16.0.4. The windows 10 version works on Ubuntu 18+ and on windows 10, but for Ubuntu 16.0.4 you have to use the ubuntu version.

windows project : https://github.com/louiskleverman/crypto-warcraft

Ubuntu 16.0.4 project : https://github.com/louiskleverman/crypto-warcraft-ubuntu

You can also access the Rinkeby version of the game through IPFS on the following link : 
https://ipfs.io/ipfs/QmbRD6biQAo9mQaMsdkxSLbU9dVhbvb55yVGmJYpnp2syu/

The game was deployed with Infura (very cool, very easy) and then the migrated version was launched on ipfs.

### Instructions

To launch the game is simple. You must first launch Ganache-Cli or the Ganache client and copy the Mnemonics  seed and open your MetaMask with the seed in order to access the private block-chain. This is so your metamask references the accounts on ganache-cli.

Next you have to open a seperate terminal and clone the project.
```
git clone https://github.com/louiskleverman/crypto-warcraft.git
```

Once you pull the git use the following function to download the dependencies :
```
npm install
```

Once the dependencies are installed use the following commands  to compile and migrate the smart contract to the private blockchain.
```
truffle compile
truffle migrate
```

If you want to deploy the contracts on ganache client instead of ganache-cli, just use the following instead:
```
truffle migrate --reset --network ganache
```

After the migration is done, you can now start the website and play the game with :
```
npm run dev
```

You are now done! 

## How to play ?

When you launch the game you will be the admin, and on the frontend the admin can't play (kind of normal if you ask me).

In order to create a character and all, you have to use another account than the one that deployed the contract.

The game works by having your very own character, and progressing it. In this iteration you are able to quest with your characters which rewards experience in order to level it up, and warcraftCoins.
You are also able to buy a new randomCharacter with the warcraftCoins.


## run tests

In order to run the written tests, you simply need to go at the root of the project and use :
```
    truffle test
```
If you are on the ganache client though, you have to use the following :
```
    truffle test --network ganache
```
