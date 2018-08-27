# Crypto Warcraft README

## What is Crypto Warcraft ?

**crypto warcraft** is an ethereum based game, similar to cryptokitties or cryptoZombies but with different functionalities and in the warcraft universe. 

## How to set it up.

### Requirements

#### MetaMask

You will need MetaMask or another Web3 injecter in order to use the website created. I haven't tested the project with other web3 injecters so I advise using MetaMask.

#### Ganache-Cli or Ganache

You will need ganache to run a local blockchain to run the game on.

### Instructions

Once you pull the git use the following function to download the dependencies :
```
npm install
```

To launch the game is simple. You must first launch Ganache-Cli or Ganache and copy the Mnemonics  seed and open your MetaMask with the seed in order to access the private block-chain. This is so your metamask references the accounts on ganache-cli.

Next you have to open a seperate terminal and navigate to the project's root folder (.../crypto-warcraft/). 
Once inside the directory use the following command line to compile and migrate the smart contract to the private blockchain.

Once deleted, at the root use the following commands :
```
truffle migrate --reset
```

If you want to deploy the contracts on ganache instead of ganache-cli, just use the following :
```
truffle migrate --reset --network ganache
```

After the migration is done, you can now start the website with :
```
npm run dev
```

then you can play !! 

## How to play ?

When you launch the game you will be the admin, and on the frontend the admin can't play (kind of normal if you ask me).

The game works by having your very own character, and progressing it. In this iteration you are able to quest with your characters which rewards experience in order to level it up, and warcraftCoins.
You are also able to buy a new randomCharacter with the warcraftCoins.
