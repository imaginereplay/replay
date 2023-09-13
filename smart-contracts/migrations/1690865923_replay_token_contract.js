const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('http://127.0.0.1:18888/rpc')
const web3 = new Web3(provider)
const BN = web3.utils.BN
const dotenv = require('dotenv');
dotenv.config();
const dec18 = new BN('1000000000000000000')
const ThetaPrivatenet = 'theta_privatenet';
const ThetaTestnet = 'theta_testnet';
const ThetaMainnet = 'theta_mainnet';
const Development = 'development';

const ReplayToken = artifacts.require("ReplayToken")

let name = "Replay Token";
let symbol = "RPLAY";
let decimal = 18;
let maxSupply = dec18.mul(new BN(1000000000));
let stakerRewardPerBlock = dec18.mul(new BN(20));
let initMintAmount = dec18.mul(new BN(600000000));
let minter;
let initDistrWallet;
let admin;

module.exports = async function (deployer, network, accounts) {
    minter = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
    if (network === ThetaTestnet) {
        minter = process.env.TESTNET_MINTER;
        admin = process.env.TESTNET_ADMIN;
        initDistrWallet = process.env.TESTNET_INIT_DISTR_WALLET;
    } else if (network === ThetaMainnet) {
        minter = process.env.MAINNET_MINTER;
        initDistrWallet = process.env.MAINNET_INIT_DISTR_WALLET; // This wallet holds 600m tokens after deployment
        admin = process.env.MAINNET_ADMIN; // Admin of the contract who can - change rewards per block, update admins etc, only admin can make updates
    } else if (network == ThetaPrivatenet) {
        minter = process.env.PRIVATENET_MINTER;
        admin = process.env.PRIVATENET_ADMIN;
        initDistrWallet = process.env.PRIVATENET_INIT_DISTR_WALLET;
    } else {
        minter = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
        admin = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
        initDistrWallet = "0x2E833968E5bB786Ae419c4d13189fB081Cc43bab";
    }

    const estimatedGas = await web3.eth.estimateGas({
        from: deployer,
        data: ReplayToken.bytecode,
    });

    const gasLimit = Math.max(estimatedGas, 6721975); // Use a minimum gas limit or a value suitable for your network


    console.log('Estimated Gas:', estimatedGas);

    console.log("***************************************************************************")
    console.log("Deploying to environment: ", network)
    console.log("Minter: ", minter)
    console.log("Admin: ", admin)
    console.log("Initial Distribution Wallet: ", initDistrWallet)
    console.log("Gas Limit", gasLimit)
    console.log("***************************************************************************")

    await deployer.deploy(ReplayToken,
        name, symbol, decimal,
        maxSupply,
        minter,
        stakerRewardPerBlock,
        initDistrWallet,
        initMintAmount,
        admin, { gas: gasLimit });
};
