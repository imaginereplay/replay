# Solo Staking

# Setup for the Mainnet Environment

**IMPORTANT**: The following instructions are currently being revised and are a WORK IN PROGRESS. Please proceed with caution and be aware that changes may be ongoing.
If any questions arise during the setup process please email [support@imaginereplay.org](mailto:support@imaginereplay.org) or contact us on #validator-support channel on discord.

**Reward mechanism**:
To incentivize all validators in the operation of the subchain, we have set the Staker reward of 10 RPLAY tokens per block. These blocks are generated every 7 seconds, and the Theta protocol calculates rewards for each staker or validator based on their staked RPLAY tokens. The more tokens staked, the higher the rewards for the staker.


### Before you Proceed:
We highly encourage going through following documentation before you proceed with main net setup:
- [Replay Whitepaper](https://assets-cdn.imaginereplay.com/docs/Imagine-Replay-Whitepaper-latest.pdf)
- [Theta Metachain Whitepaper](https://assets.thetatoken.org/theta-mainnet-4-whitepaper.pdf)
- [Theta Subchain Testnet Setup](https://github.com/thetatoken/theta-metachain-guide/blob/master/docs/2-testnet/manual-flow/1-setup.md)

### Overview of Setting up Replay validator:
This document offers an overview of launching a validator to be part of Replay subchain. At a high level, the process involves the following steps:
- **Requirements**: All the hardware requirements and tokens needed to start and stake into a validator.
- **Set up**: This involves setting up all the binaries that are needed to run main chain node and sub chain node. You run this only once. You will set up main chain node, main chain eth rpc and sub chain binaries. You will also set up a workspace folder with theta metachain guide which runs the scripts from here - [Theta Metachain Guide](https://github.com/thetatoken/theta-metachain-guide)
- **Run the node in read only mode**: This phase precedes staking. Once this setup is complete, your node is operational, connecting to peers to confirm block finalization. Staking rewards won't be visible at this stage, as no RPLAY tokens have been staked yet. Ensure all four processes are functioning without issues and that you observe the expected output before moving forward.  
- **Staking to Validator**: In this phase, RPLAY tokens are staked within the validator, enabling the staker to start accumulating rewards. When completed, your validator should be visible in the list of nodes on the subchain explorer. This signals that other stakers can commence depositing their stakes into your validator.

## Requirements
You need to have a machine with following requirements and periodically monitor if all the processes are running as expected. These are recommended by Theta team to run a validator as part of Replay sub chain:

### Hardware Minimum Requirements:
- Memory: 16 GB RAM
- CPU: 8 cores
- Storage Disk: 1 TB SSD
- Network Bandwidth: 200Mbps symmetrical commercial network
- Operating System: Ubuntu

You may use AWS, Google or any other cloud hosting services that can satisfy above requirements. For example - m6a.2xlarge on AWS with added 1 TB SSD storage will give you the right instance.

### Admin wallet creation:

First, please set up an admin wallet. You can generate it using the `thetacli key new` command or through the [Theta Web Wallet](https://wallet.thetatoken.org/unlock/keystore-file). If you generate the wallet using `thetacli key new`, it will automatically place the keystore file under `~/.thetacli/keys/encrypted/`. If you generate the key using the Theta Web Wallet, please copy the keystore file to the same folder.

### Admin requirements:

In addition to the hardware requirements, you will need the following tokens:
- 1000 wTheta: If you have THETA tokens, they can be wrapped on the Theta Wallet.
- 20,000 TFUEL + additional to cover gas fees : This amount is required to cover cross-chain transfers that require TFUEL. Additional gas fees is to perform deposit stake transaction. 
- At least 1 RPLAY token :)

## Setup (Run once)

First, please make sure the following software are installed on your machine:
- [Golang](https://go.dev/dl/) 1.14 or higher version. Please make sure Golang related env variables like `$GOPATH` are set properly.
- [Node.js](https://nodejs.org/en/download)

Also refer - [Theta Subchain Setup](https://github.com/thetatoken/theta-metachain-guide/tree/master/docs/0-overview) for more details. The following steps are directly quoted from the documentation on theta metachain guide. Please refer the guide as well while running these steps. 

You need to understand that - there will be 4 processes running on each instance. They will be:
- Main Chain Node - Default Port: 12000
- Main chain ETH RPC adapter - Default Port: 16888
- Subchain Node - Default Port: 12100
- Sub chain ETH RPC adapter - Default Port: 16900

According to the [Theta Metachain Whitepaper](https://assets.thetatoken.org/theta-mainnet-4-whitepaper.pdf)

### 1 Compile the Theta binaries

Compile the Theta binaries from the source code:

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

### 2 Compile the ETH RPC Adapter binary

Compile the ETH RPC Adapter binary from the source code:

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

### 3 Compile the Subchain binaries

Compile the subchain binaries from the source code:

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

### 4 Setup the Workspace for the Mainnet Environment

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

# Run the node in read only mode:

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

### 2.1 Update configs.js 

Update following config values before proceeding:
```shell
cd ~/metachain_playground/theta-metachain-guide/sdk/js
vi configs.js
```

Under `MainnetConfigs` change the following values:
- `govTokenContractAddr` - `0x3Da3D8CDE7B12CD2CBb688E2655BcaCD8946399D`
- `subchainID` - `77529`
- `subchainIDStr` - `tsub77529`

Make sure rest of the config contract addresses match with [Theta Mainnet Configs](https://github.com/thetatoken/theta-metachain-guide/blob/master/sdk/js/configs.js)

### 2.2 Update configs.yaml for validator

We also need to update the configs for the validator:
```shell
cd ~/metachain_playground/mainnet/subchain/validator
vi config.yaml
```

Update following values:
- `genesis.hash` - `0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0`
- `chainID` - `77529`
- `p2p.seeds` - `35.91.247.238:12100` 

## 3. Download subchain snapshot

Please contact admin [support@imaginereplay.org](mailto:support@imaginereplay.org) or on discord channel #validator-support for the latest snapshot of subchain. We are currently working on setting up auto backups.

Place the snapshot file under `~/metachain_playground/mainnet/subchain/validator`

## 4. Run the Subchain validator and the ETH RPC Adapter

Next, please place the keystore file of your subchain validator under `~/metachain_playground/mainnet/subchain/validator/key/encrypted/`. You can run following commands to do that:

```shell
cd ~/metachain_playground/testnet/subchain/validator
mkdir -p key/encrypted/
cp ~/.thetacli/keys/encrypted/YOUR_KEYSTORE key/encrypted/
```

We can start the ETH RPC adapter and the Subchain Validator. We need start the subchain ETH RPC adapter **before** starting the subchain validator. This order is important:

```shell
cd ~/metachain_playground/mainnet/workspace
theta-eth-rpc-adaptor start --config=../subchain/ethrpc
```

Now start the subchain node:

```shell
cd ~/metachain_playground/mainnet/workspace
thetasubchain start --config=../subchain/validator --password=<VALIDATOR_PASSWORD>
```

The `VALIDATOR_PASSWORD` above corresponds to the password of the keystore file stored in `~/metachain_playground/mainnet/subchain/validator/key/encrypted/`. Once the above process starts running it may take some time to sync to the subchain1c1 

## 5. Open validator and ETH RPC ports

Now that we have our validator running we need to open some ports so other validators can discover the node. We can verify this by calling the RPC endpoint to make sure everything is set up correctly before we move to staking step.

Assuming you did not change the ports in any of the config files above - open following sub chain ports to the public so any ip address can call them:
- Subchain Node - Open Port: 12100
- Sub chain ETH RPC adapter - Open Port: 16900

Make following curl request and check the response to make sure everything is set up well:
```shell
curl -X POST -H 'Content-Type: application/json' --data '{"id":1,"jsonrpc":"2.0","method": "theta.GetStatus","params":[]}' http://<YOUR_VALIDATOR_IP_ADDRESS>:16900/rpc

{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "address": "<YOUR_VALIDATOR_ADDRESS>",
        "chain_id": "tsub77529",
        "peer_id": "0xE1A8f31CebeFa3E469b3a45B8CEc2f4C22945407", // this might vary
        "latest_finalized_block_hash": "0x4ced990fc513db2cf0fd18b615fd904e60344767b5c94eaeda219b53c619cb04", // this might vary
        "latest_finalized_block_height": "359239", // this might vary
        "latest_finalized_block_time": "1694555950", // this might vary
        "latest_finalized_block_epoch": "359239", // this might vary
        "current_epoch": "359241", // this might vary
        "current_height": "359239", // this might vary
        "current_time": "1694555958", // this might vary
        "syncing": false, // this should be false
        "genesis_block_hash": "0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0", // this might vary 
        "snapshot_block_height": "0", // this might vary
        "snapshot_block_hash": "0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0" // this might vary
    }
}

```

If you make repeated calls you will observe that `latest_finalized_block_height` will increase with time as new blocks are created. Congratulations! You have successfully set up a node, ETH RPC adapter and now finalizing blocks. 

At this point please contact [support@imaginereplay.org](mailto:support@imaginereplay.org), do not post your IP address or validator address on discord yet. Once we confirm the validator is running smoothly we will proceed to next step to stake RPLAY tokens, so you can start earning rewards.

## Stake to a New Validator

As a validator you can stake any amount of RPLAY. There is no limit on amount of RPLAY as long as the admin/operator wallet holds 20k TFuel + additional gas fees  and 1000 wTheta. These funds are held as collateral against running the subchain. Refer to Theta white paper for more details on the protocol.

By now you should have completed all the setup and have a validator that's running successfully. Please make sure you contact [support@imaginereplay.org](mailto:support@imaginereplay.org) before staking RPLAY. If you are validated by RPLAY team then go ahead and proceed to the next step:

```shell
cd ~/metachain_playground/theta-metachain-guide/sdk/js
node depositStake.js mainnet <STAKE_AMOUNT> <VALIDATOR_ADDRESS> <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```

`STAKE_AMOUNT` is the RPLAY amount that is being staked. Make sure wallet holds the `STAKE_AMOUNT`. Please be mindful that this amount is represented in WEI so for example if you are staking 5000 RPLAY the command looks like this:

```shell
node depositStake.js mainnet 5000000000000000000000 <VALIDATOR_ADDRESS> <PATH/TO/ADMIN_WALLET_KEYSTORE_FILE> <ADMIN_WALLET_PASSWORD>
```

The script prints out the ValidatorSet of the next dynasty. Make sure your validators are included. If not, please search with the tx hash on the [Theta Explorer](https://explorer.thetatoken.org/) and see why it failed. A possible cause is that the admin wallet does not have sufficient amount of wTHETA and TFuel (least 1,000 wTHETA and 20,000 TFuel + additional for gas fees are required).

You have to wait ~14-18 hours for the validator to become a functional validator. Please shoot us an email once the staking is completed. Keep an eye on this page for your validator to appear - [Subchain Validators](https://tsub77529-explorer.thetatoken.org/stakes). Once you see your validator address appear congratulations, you are part of replay subchain ecosystem! 