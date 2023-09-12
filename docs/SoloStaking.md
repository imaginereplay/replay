# Solo Staking

# Setup for the Mainnet Environment

**IMPORTANT**: The following instructions are currently being revised and are a WORK IN PROGRESS. Please proceed with caution and be aware that changes may be ongoing.
If any questions arise during the set up process please email support@imaginereplay.com or contact us on #validator-support channel on discord.

## Requirements
You need to have a machine with following requirements and periodically monitor if all the process are running as expected.

### Hardware requirements:
- Memory: 16 GB
- CPU: 16 cores
- Storage Disk: 1 TB SSD
- Network Bandwidth: 200Mbps symmetrical commercial network
- Operating System: Ubuntu

### Admin wallet creation:

First, please setup an admin wallet. You can generate it using the `thetacli key new` command or through the [Theta Web Wallet](https://wallet.thetatoken.org/unlock/keystore-file). If you generate the wallet using `thetacli key new`, it will automatically place the keystore file under `~/.thetacli/keys/encrypted/`. If you generate the key using the Theta Web Wallet, please copy the keystore file to the same folder.

### Admin requirements:

In addition to the hardware requirements, you will need the following tokens:
-1000 wTheta: If you have THETA tokens, they can be wrapped on the Theta Wallet.
-20000 TFUEL: This amount is required to cover cross-chain transfers that require TFUEL.

## 1. Setup (Run once)

First, please make sure the following software are installed on your machine:
- [Golang](https://go.dev/dl/) 1.14 or higher version. Also please make sure Golang related env variables like `$GOPATH` are set properly.
- The [Truffle suite](https://trufflesuite.com/docs/truffle/getting-started/installation/) for smart contract compilation and deployment

### 1.1 Compile the Theta binaries

Compile the Theta binaries from source code:

```shell
# Make sure your $GOPATH env variable is set properly below running the following commands
mkdir -p $GOPATH/src/github.com/thetatoken

git clone https://github.com/thetatoken/theta-protocol-ledger.git $GOPATH/src/github.com/thetatoken/theta
export THETA_HOME=$GOPATH/src/github.com/thetatoken/theta
cd $THETA_HOME
git checkout release
git pull origin release
export GO111MODULE=on
make install
```

### 1.2 Compile the ETH RPC Adapter binary

Compile the ETH RPC Adapter binary from source code:

```shell
cd $GOPATH/src/github.com/thetatoken
git clone https://github.com/thetatoken/theta-eth-rpc-adaptor
export THETA_ETH_RPC_ADAPTOR_HOME=$GOPATH/src/github.com/thetatoken/theta-eth-rpc-adaptor
cd $THETA_ETH_RPC_ADAPTOR_HOME
git checkout main
git pull origin main
export GO111MODULE=on
make install
```

### 1.3 Compile the Subchain binaries

Compile the subchain binaries from source code:

```shell
# switch THETA to the sc-privatenet branch before compiling thetasubchain
cd $THETA_HOME
git checkout sc-privatenet
git pull origin sc-privatenet

git clone https://github.com/thetatoken/theta-protocol-subchain.git $GOPATH/src/github.com/thetatoken/thetasubchain
export SUBCHAIN_HOME=$GOPATH/src/github.com/thetatoken/thetasubchain
cd $SUBCHAIN_HOME
git checkout master
git pull origin master
export GO111MODULE=on
make install
```

### 1.4 Setup the Workspace for the Mainnet Environment

Run the following commands to setup the workspace:

```shell
cd ~
mkdir -p metachain_playground
mkdir -p metachain_playground/mainnet
mkdir -p metachain_playground/mainnet/workspace

# skip the following command if you have cloned this repo earlier
cd ~/metachain_playground/
git clone https://github.com/thetatoken/theta-metachain-guide
cd theta-metachain-guide
export METACHAIN_GUIDE_ROOT=`pwd`
cd sdk/js
npm install
```
Make sure that the new admin wallet key is in this folder: `~/.thetacli/keys/encrypted/`

Next, copy over the configs for both the Main Chain and the Subchain:

```shell
cd $METACHAIN_GUIDE_ROOT
rm -rf ~/metachain_playground/mainnet/mainchain
rm -rf ~/metachain_playground/mainnet/subchain
cp -r sdk/configs/mainnet/* ~/metachain_playground/mainnet/
```

Then, download the latest snapshot of the Mainnet Main Chain.

```shell
cd ~/metachain_playground/mainnet/mainchain/walletnode
wget -O ./snapshot `curl -k https://mainnet-data.thetatoken.org/snapshot`
curl -k --output ./config.yaml `curl -k 'https://mainnet-data.thetatoken.org/config?is_guardian=true'`
```

# Subchain Validator Staking:

**IMPORTANT**: The following instructions are currently being revised and are a WORK IN PROGRESS. Please proceed with caution and be aware that changes may be ongoing.

## 1. Start the Main Chain node and its ETH RPC Adapter

Execute the following commands to start the Main Chain node:

```shell
mkdir -p ~/metachain_playground/mainnet/workspace
cd ~/metachain_playground/mainnet/workspace
theta start --config=../mainchain/walletnode --password=<YOUR_MAIN_CHAIN_NODE_PASSWORD>
```

Wait until the Main Chain walletnode gets insync with the network. This may take some time (e.g. 1-2 hours). You can run the following command to check its synchronization status. If in the output says `"syncing": false` it means the node is synced to the latest block.

```shell
thetacli query status
```

**After** the Main Chain walletnode is in-sync with the network, run the following command in *another terminal*:

```shell
cd ~/metachain_playground/mainnet/workspace
theta-eth-rpc-adaptor start --config=../mainchain/ethrpc
```

## 2. Update configs

Make a curl request to this endpoint to get the updated configs for the subchain:

```shell
curl -X POST -H 'Content-Type: application/json' --data '{"id":1,"jsonrpc":"2.0","method": "theta.GetStatus","params":[]}' https://rpc-tsub77529.imaginereplay.com/rpc
```

The response looks like this:
```shell
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "address": "0xE1A8f31CebeFa3E469b3a45B8CEc2f4C22945407",
        "chain_id": "tsub77529",
        "peer_id": "0xE1A8f31CebeFa3E469b3a45B8CEc2f4C22945407",
        "latest_finalized_block_hash": "0x4ced990fc513db2cf0fd18b615fd904e60344767b5c94eaeda219b53c619cb04",
        "latest_finalized_block_height": "359239",
        "latest_finalized_block_time": "1694555950",
        "latest_finalized_block_epoch": "359239",
        "current_epoch": "359241",
        "current_height": "359239",
        "current_time": "1694555958",
        "syncing": false,
        "genesis_block_hash": "0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0",
        "snapshot_block_height": "0",
        "snapshot_block_hash": "0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0"
    }
}
```

Update following config values before proceeding:
```shell
cd ~/metachain_playground/theta-metachain-guide/sdk/js
vi configs.js
```

Under `MainnetConfigs` change the following values:
- `govTokenContractAddr` - `0x3Da3D8CDE7B12CD2CBb688E2655BcaCD8946399D`
- `subchainID` - `77529`
- `subchainIDStr` - `tsub77529`

Make sure rest of the config contract addresses match with [Theta Main Repo Documentation](https://github.com/thetatoken/theta-metachain-guide/blob/master/docs/2-testnet/manual-flow/2-register-and-staking.md)

We also need to update the configs for the validator:
```shell
cd ~/metachain_playground/mainnet/subchain/validator
vi config.yaml
```

Update following values:
- `genesis.hash` - `0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0`
- `chainID` - `77529`

## 4. Download subchain snapshot

Please contact admin support@imaginereplay.com or on discord channel #validator-support for the latest snapshot of subchain. We are currently working on setting up auto backups

## 5. Stake to a New Validator

As a validator you can stake any amount of RPLAY. There is no limit on amount of RPLAy as long as the admin/operator wallet holds 20k TFuel and 1000 wTheta.

```shell
cd ~/metachain_playground/theta-metachain-guide/sdk/js
node depositStake.js mainnet <INIT_STAKE_AMOUNT> <VALIDATOR_ADDRESS> <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```
`INIT_STAKE_AMOUNT` is the RPLAY amount that is being staked. Make sure wallet holds the `INIT_STAKE_AMOUNT`
The script prints out the ValidatorSet of the next dynasty. Make sure your validators are included. If not, please search with the tx hash on the [Theta Explorer](https://explorer.thetatoken.org/) and see why it failed. A possible cause is that the admin wallet does not have sufficient amount of wTHETA and TFuel (least 1,000 wTHETA and 20,000 TFuel are required).

## 6. Run the Subchain validator and the ETH RPC Adapter

After the above staking transaction is finalized, we can start the ETH RPC adapter and the Subchain Validator. We need start the subchain ETH RPC adapter **before** starting the subchain validator. This order is important.

```shell
cd ~/metachain_playground/mainnet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc
```

Next, please place the keystore file of your subchain validator (i.e. the keystore file corresponds to`<VALIDATOR_ADDRESS>` you specified above) under `~/metachain_playground/mainnet/subchain/validator/key/encrypted/`. Then, run the following command to start the validator:


```
cd ~/metachain_playground/mainnet/workspace
thetasubchain start --config=../subchain/validator --password=<VALIDATOR_PASSWORD>
```

If the Subchain starts finalizing blocks, congratulations! You have succuessfully configured and launched a Subchain for the Metachain Mainnet! The Subchian validator should produce and finalize a block every second, which is much faster than the Main Chain. Next, you can use the JS SDK we provide to send digital assets (TFuel, TNT20/721/1155 tokens) between the Main Chain and the Subchain, which also serve as good sanity checks regarding whether the Subchain is functioning correctly.



