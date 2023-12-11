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

Please ensure that you utilize a dedicated machine solely for running your validator. Running other software on the same machine is discouraged, as these processes demand a significant amount of processing power and bandwidth.

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

For added convenience, we've also added documentation outlining a Docker-based approach to streamline the process [here](https://github.com/imaginereplay/subchain-docker).
Otherwise, please follow the steps below for Mainchain and Subchain setup.

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

## 2. Update/Download configs for validator

### 2.1 Update/Download configs.yaml for validator

Follow these steps to download the validator config file.

```shell
cd ~/metachain_playground/mainnet/subchain/validator
wget -O ./config.yaml 'https://replay-subchain.s3.amazonaws.com/config.yaml'
```

### 2.2 Update/Download configs.yaml for ETH RPC adapter

There should be a config.yaml already added to subchain ethrpc adapter folder. We need to update the values as follows:

```shell
cd /home/ubuntu/metachain_playground/mainchain/subchain/ethrpc
vi config.yaml
```

Update `rpc.httpAddress` -> `0.0.0.0`

The final config.yaml for eth rpc should match this:
```shell
theta:
  rpcEndpoint: "http://127.0.0.1:16900/rpc"
node:
  skipInitializeTestWallets: true
rpc:
  enabled: true
  httpAddress: "0.0.0.0"
  httpPort: 19888
  wsAddress: "127.0.0.1"
  wsPort: 19889
  timeoutSecs: 600
  maxConnections: 2048
log:
  levels: "*:debug"
```

## 3. Download subchain snapshot

Follow these steps to download the snapshot.

```shell
cd ~/metachain_playground/mainnet/subchain/validator
wget -O ./snapshot 'https://replay-subchain.s3.amazonaws.com/snapshots/snapshot'
```

## 4. Run the Subchain validator and the ETH RPC Adapter

Next, please place the keystore file of your subchain validator under `~/metachain_playground/mainnet/subchain/validator/key/encrypted/`. You can run following commands to do that:

```shell
cd ~/metachain_playground/mainnet/subchain/validator
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

The `VALIDATOR_PASSWORD` above corresponds to the password of the keystore file stored in `~/metachain_playground/mainnet/subchain/validator/key/encrypted/`. Once the above process starts running it may take some time to sync to the subchain.

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

## 5. Sanity Checks

If you come across any issues with following checks please refer to our troubleshooting guide for tips.

Once everything seems like its running fine. We need to make following sanity checks:

### 5.1 Test Main chain Node:

We need to make sure the main chain node is completely synced:

```shell
thetacli query status
```

The response should look as follows:
```shell
{
    "address": "YOUR_VALIDATOR_ADDRESS",
    "chain_id": "mainnet",
    "current_epoch": "SYSTEM_TIME",
    "current_height": "THIS_VALUE_INCREMENTS",
    "current_time": "SYSTEM_TIME",
    "genesis_block_hash": "0xd8836c6cf3c3ccea0b015b4ed0f9efb0ffe6254db793a515843c9d0f68cbab65",
    "latest_finalized_block_epoch": "THIS_MAY_DIFFER",
    "latest_finalized_block_hash": "THIS_MAY_DIFFER",
    "latest_finalized_block_height": "THIS_VALUE_INCREMENTS",
    "latest_finalized_block_time": "THIS_MAY_DIFFER",
    "peer_id": "THIS_MAY_DIFFER",
    "snapshot_block_hash": "THIS_MAY_DIFFER",
    "snapshot_block_height": "THIS_VALUE_INCREMENTS",
    "syncing": false
}
```

It is very important to make sure that the value `"syncing": false` is set to `false`. This means that main chain node has completely synced all blocks with theta main chain node. This will take few hours since you started. If the sync is still not completed [support@imaginereplay.org](mailto:support@imaginereplay.org) or on discord #validator-support channel. Please raise this issue with theta team as well.


### 5.2 Test Main chain ETH RPC adapter:

The main chain node above should completely sync and return `"syncing": false` before proceeding to this step. Assuming you already started main chain eth rpc process from steps above:

Run this command:
```shell
curl --location --request POST 'http://localhost:18888/rpc' \
--header 'Content-Type: application/json' \
--data-raw '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":67}'
```

The response should look like this:
```shell
{
  "jsonrpc": "2.0",
  "id": 67,
  "result": "0x16d"
}
```

### 5.3 Test Sub chain ETH RPC Adapter:

Run following command:

```shell
curl --location --request POST 'http://localhost:19888/rpc' --header 'Content-Type: application/json' --data-raw '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":67}'
```

Response should be:

```shell
{
  "jsonrpc":"2.0",
  "id":67,
  "result":"0x30e375aadebd7205"
}
```
### 5.4 Test Sub chain Node:

Once all the above steps are working and assuming you started subchain eth rpc, and you have no errors, run these commands:

```shell
curl --location --request POST 'http://localhost:16900/rpc' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "theta.GetStatus",
  "params": [
  ]
}'
```

The response should look like this:
```shell
{
    "jsonrpc": "2.0",
    "id": 1,
    "result": {
        "address": "YOUR_VALIDATOR_ADDRESS",
        "chain_id": "tsub77529",
        "peer_id": "THIS_MAY_DIFFER",
        "latest_finalized_block_hash": "THIS_MAY_DIFFER",
        "latest_finalized_block_height": "THIS_VALUE_INCREMENTS",
        "latest_finalized_block_time": "SYSTEM_TIME",
        "latest_finalized_block_epoch": "SYSTEM_TIME",
        "current_epoch": "SYSTEM_TIME",
        "current_height": "THIS_VALUE_INCREMENTS",
        "current_time": "SYSTEM_TIME",
        "syncing": false,
        "genesis_block_hash": "0x3daa5a4fc3533a00e087352b4ec51cb82575e1d6e66fd6b1a4047c5d2ea171d0",
        "snapshot_block_height": "THIS_MAY_DIFFER",
        "snapshot_block_hash": "THIS_MAY_DIFFER"
    }
}
```

Similar to main chain node the above response should also have - `"syncing": false`. Once you receive above response proceed to next step.

### 5.5 Test Sub chain Node from external IP address:

This is an important step especially if you are running validator from your home wifi, since this will confirm that your port is indeed discoverable over internet. Try to make this call from a different machine/IP.

```shell
curl --location --request POST 'http://YOUR_IP_ADDRESS:16900/rpc' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "theta.GetStatus",
  "params": [
  ]
}'
```

If you see the response similar to above that's amazing! You set up is complete. 

If you don't see a response, check if your port 16900 and 12100 is discoverable from internet, by running: `sudo netstat -lt`. If you see that it is available but still cannot make calls. 
- Download - https://ngrok.com/
- `cd ~/Downloads`
- `./ngrok http 16900`
- You will get a response :  `Forwarding                    http://xxxxx.ngrok.io/ -> http://localhost:16900/`
- Now make the following call to the ngrok url from above and test:

```shell
curl --location --request POST 'http://xxxxx.ngrok.io/rpc' \
--header 'Content-Type: application/json' \
--data-raw '{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "theta.GetStatus",
  "params": [
  ]
}'
```
This will open the port and accept connections. Head over to next section.

## Stake to a New Validator

### 6.1 Update/Download configs.js

Download the latest configs.js:

```shell
cd ~/metachain_playground/theta-metachain-guide/sdk/js
wget -O ./configs.js 'https://replay-subchain.s3.amazonaws.com/configs.js'
```

Make sure the config contract addresses match with [Theta Mainnet Configs](https://github.com/thetatoken/theta-metachain-guide/blob/master/sdk/js/configs.js). If you see any discrepancies, please contact theta/replay support.

As a validator you can stake any amount of RPLAY. There is no limit on amount of RPLAY as long as the admin/operator wallet holds 20k TFuel + additional gas fees  and 1000 wTheta. These funds are held as collateral against running the subchain. Refer to Theta white paper for more details on the protocol.

### 6.2 Validation from Replay Support Team

By now you should have completed all the setup and have a validator that's running successfully along with main chain node.

Please make sure you contact [support@imaginereplay.org](mailto:support@imaginereplay.org) before staking RPLAY.

If you are validated by RPLAY team and got a go ahead then proceed to the next step:

### 6.3 Deposit stake to a validator

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

## Post Validator Setup

Now that you have successfully set up your validator and staked Replay tokens, here are a few important points to keep in mind:

### Can Other Users Stake to My Validator?

Yes, now that your validators are part of the ecosystem, other users can deposit their rewards into your validator. Community members have established staking platforms that simplify the process of staking to existing validators. If you notice that your validator is receiving more rewards than expected, it might be due to staked user rewards. You can monitor this activity on the [Replay Subchain Validator Stakes](https://tsub77529-explorer.thetatoken.org/stakes) page.

### How Does My Validator Earn Rewards?

As part of the validator pool rewards, each validator currently earns 150,000 RPLAY tokens vested over a year. These tokens are airdropped every month as long as your validator continues to perform and create new blocks.

### How Do My Staked Tokens Earn Rewards?

The staker reward per block is currently set at 10 RPLAY tokens. A new block is generated approximately every 7 seconds, and the Theta protocol calculates rewards for each staker proportionally to their staked RPLAY tokens. The more tokens you stake, the higher your rewards as a staker.

It's important to note that the 10 RPLAY tokens are not awarded per staker individually; instead, all stakers collectively earn a total of 10 RPLAY tokens per block. This total is then distributed among each validator in proportion to the amount staked.

For example, if there are 10 stakers, each with 10 staked RPLAY tokens, they will equally share the 10 RPLAY tokens generated in each block. In this scenario, each staker will receive 1 RPLAY per block. The RPLAY tokens received are directly proportional to the number of staked tokens. More details on staker rewards can be found in the Theta Whitepaper.

### How Can I Unstake/Withdraw My Tokens?

Please refer to the unstake/withdrawal guidelines provided in the Theta documentation here: [Withdraw and Claim Stakes](https://github.com/thetatoken/theta-metachain-guide/blob/master/docs/2-testnet/manual-flow/4-more-on-subchain-validator-staking.md#claim-the-stakes-back).

For the most up-to-date instructions on mainchain unstaking and withdrawal guidelines, please contact the Theta team. The provided link is specific to the testnet, as the mainnet documentation may not be updated yet.

In the future, we may have a community-established user interface (UI) that simplifies this process further.


# Troubleshooting Guide

## 1. Main Chain Node Syncing Issues

**Issue:** If the Main Chain node is not syncing properly, it can cause delays in the setup process.

**Solution:**
- Make sure you are using a machine that meets the hardware requirements specified.
- Check your internet connection for stability, as a poor network connection can slow down the syncing process.
- Verify that your `GOPATH` environment variable is set correctly before compiling the Theta binaries.
- Ensure that you are using the correct Theta repository and branch (e.g., `sc-privatenet`) for the Theta binaries.
- Monitor the syncing progress by running `thetacli query status` and ensure that `"syncing": false` is eventually set to `false`. If syncing is still not complete after several hours, contact [support@imaginereplay.org](mailto:support@imaginereplay.org) or ping us on our discord #validator-support channel.

## 2. Main Chain ETH RPC Adapter Issues

**Issue:** If the Main Chain ETH RPC Adapter is not functioning properly, it can disrupt communication with the Main Chain node.

**Solution:**
- Double-check the configuration settings for the Main Chain ETH RPC Adapter.
- Ensure that you have started the Main Chain ETH RPC Adapter with the correct configuration file. This file is located at `~/metachain_playground/mainchain/mainchain/ethrpc`
- Verify that the Main Chain node is running and properly synced before starting the ETH RPC Adapter.
- Test the Main Chain ETH RPC Adapter by sending a request to the endpoint and checking for a valid response.

## 3. Sub Chain ETH RPC Adapter Issues

**Issue:** Similar to the Main Chain ETH RPC Adapter, problems with the Sub Chain ETH RPC Adapter can affect communication between components.

**Solution:**
- Review the configuration settings for the Sub Chain ETH RPC Adapter.
- Confirm that you have started the Sub Chain ETH RPC Adapter using the correct configuration file. This file is located at `~/metachain_playground/mainnet/subchain/ethrpc`
- Ensure that the Sub Chain node is operational and synchronized before starting the ETH RPC Adapter.
- Test the Sub Chain ETH RPC Adapter by sending a request to its endpoint and checking for a valid response.
- Make sure the value for `rpc.httpAddress` is set to `0.0.0.0`

## 4. Sub Chain Node Syncing Issues

**Issue:** If the Sub Chain node is not syncing properly, it may cause delays in becoming a functional validator.

**Solution:**
- Check the configuration settings for the Sub Chain node and make sure they are accurate.
- Ensure that you have started the Sub Chain node with the correct configuration file. This file is located at `~/metachain_playground/mainnet/subchain/validator`
- All the values for subchain config file should match the values mentioned above in `Update/Download configs.yaml for validator` section.
- Make sure the validator key file is added under `~/metachain_playground/mainnet/subchain/validator/key/encrypted` and the password matches the one you used when you created the key.
- Monitor the syncing progress by sending a request to the Sub Chain node's endpoint and verifying that `"syncing": false` is eventually set to `false`.
- If syncing takes an unusually long time or encounters errors, contact [support@imaginereplay.org](mailto:support@imaginereplay.org).

## 6. Opening Ports for Validator

**Issue:** Failure to open the required ports can prevent other validators from discovering your node.

**Solution:**
- Make sure to open the necessary ports for the Subchain Node and Sub Chain ETH RPC Adapter to the public, as specified in the documentation above.
- Use the provided curl request to verify that the ports are open and accessible from other IP addresses.
- Confirm that your firewall settings and cloud hosting configurations are correctly configured to allow incoming connections.
- If you are running from your personal Wifi, some ISP's block external connections. In those cases you might have to open the port manually using external tools such as - https://ngrok.com/. The details are in section `5.5 Test Sub chain Node from external IP address:`

## 7. My Validator is still not working

**Issue:** If your validator is still not working even after running all the steps from above. 

**Solution:**
Make sure the order of the 4 processes above is correctly run. The order is as follows: 
1. Mainchain Node - This should be completely synced
2. Mainchain ETH RPC Adapter 
3. Subchain ETH RPC Adapter
4. Subchain Node - This should be completely synced and the logs should indicate that the blocks are finalized.

## 8. Errors running binaries on Mac OS

**Issue:** Though these binaries are not supported on non-ubuntu environments, if you are interested in running on your machine, you might encounter errors during make install step of installing binaries

**Solution:**
If you see errors similar to this:
```shell
make install
go install ./cmd/...
go: github.com/thetatoken/theta@v0.0.0 requires
golang.org/x/sys@v0.0.0-20220412071739-889880a91fd5: missing go.sum entry for go.mod file; to add it:
    go mod download golang.org/x/sys
```

You need to run this command and r-run `make install` again
```shell
go mod download golang.org/x/sys 
```

If you get following warnings:
```shell
In file included from ../../../../pkg/mod/github.com/karalabe/hid@v0.0.0-20180420081245-2b4488a37358/hid_enabled.go:38:

../../../../pkg/mod/github.com/karalabe/hid@v0.0.0-20180420081245-2b4488a37358/hidapi/mac/hid.c:693:34: warning: 'kIOMasterPortDefault' is deprecated: first deprecated in macOS 12.0 [-Wdeprecated-declarations]

/Library/Developer/CommandLineTools/SDKs/MacOSX.sdk/System/Library/Frameworks/IOKit.framework/Headers/IOKitLib.h:133:19: note: 'kIOMasterPortDefault' has been explicitly marked deprecated here

make:  [release] Error 1
```

Replace the following file:
```shell
cd $GOPATH/src/github.com/thetatoken/theta
or
cd $THETA_HOME

# depending on your os you might have to replace one of these files:  mul_amd64.h/ mul_arm64.h 
wget https://replay-subchain.s3.amazonaws.com/mul_arm64.h

make install
```

If users encounter any other issues or error messages during the setup process, they should consider reaching out to [support@imaginereplay.org](mailto:support@imaginereplay.org) or the #validator-support channel on Discord for assistance. Always proceed with caution and ensure that you have followed the setup instructions accurately before troubleshooting.
