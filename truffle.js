//var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,     // Ganache software
      network_id: "*" // Match any network id
    }, 
    ganache: {
      host: "127.0.0.1",
      port: 7545,     // Ganache software
      network_id: "*", // Match any network id
      
      //gas: 6000000 // Gas limit used for deploys
    }
  }
};
