/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * https://trufflesuite.com/docs/truffle/reference/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */
require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    theta_privatenet: {
      provider: () => {
        var deployerPrivateKey = process.env.PRIVATENET_DEPLOYER_PRIVATE_KEY;

        var privateKeyTest01 = '1111111111111111111111111111111111111111111111111111111111111111';
        var privateKeyTest02 = '93a90ea508331dfdf27fb79757d4250b4e84954927ba0073cd67454ac432c737';
        var privateKeyTest03 = '3333333333333333333333333333333333333333333333333333333333333333';
        var privateKeyTest04 = '4444444444444444444444444444444444444444444444444444444444444444';
        var privateKeyTest05 = '5555555555555555555555555555555555555555555555555555555555555555';
        var privateKeyTest06 = '6666666666666666666666666666666666666666666666666666666666666666';
        var privateKeyTest07 = '7777777777777777777777777777777777777777777777777777777777777777';
        var privateKeyTest08 = '8888888888888888888888888888888888888888888888888888888888888888';
        var privateKeyTest09 = '9999999999999999999999999999999999999999999999999999999999999999';

        return new HDWalletProvider({
          privateKeys: [deployerPrivateKey, privateKeyTest01, privateKeyTest02, privateKeyTest03, privateKeyTest04, privateKeyTest05, privateKeyTest06, privateKeyTest07, privateKeyTest08, privateKeyTest09],
          providerOrUrl: 'http://127.0.0.1:18888/rpc',
        });
      },
      network_id: 366,
      gasPrice: 4000000000000,
      networkCheckTimeout: 1000000,
      timeoutBlocks: 1000
    },
    theta_testnet: {
      provider: () => {
        var deployerPrivateKey = process.env.TESTNET_DEPLOYER_PRIVATE_KEY;

        return new HDWalletProvider({
          privateKeys: [deployerPrivateKey],
          providerOrUrl: 'http://localhost:28888/rpc', // deploy using a local node synced with the Testnet
        });
      },
      network_id: 365,
      gasPrice: 4000000000000,
      networkCheckTimeout: 1000000,
      timeoutBlocks: 1000
    },
    theta_mainnet: {
      provider: () => {
        var deployerPrivateKey = process.env.MAINNET_DEPLOYER_PRIVATE_KEY;

        return new HDWalletProvider({
          privateKeys: [deployerPrivateKey],
          providerOrUrl: 'https://eth-rpc-api.thetatoken.org/rpc',
        });
      },
      network_id: 361,
      gasPrice: 4000000000000,
      networkCheckTimeout: 1000000,
      timeoutBlocks: 1000
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.11",      // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      }
    }
  },
  plugins: [
      "solidity-coverage",
      "@chainsafe/truffle-plugin-abigen",
  ]
};
