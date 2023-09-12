// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.11;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
* @title ReplayToken
* @notice TNT20 token for Replay subchain on theta network blockchain
* @dev This token is the Governance token of Replay subchain on Theta Blockchain
*/
contract ReplayToken is ERC20 {
    using SafeMath for uint256;
    /**
     * @dev represents the decimal value of the token. Once set in constructor cannot be changes. Its set to 18
     */
    uint8 private immutable _decimals;

    /**
     * @dev Rewards earned by staker per block based on staked amount
     */
    uint256 private _stakerRewardPerBlock;

    /**
     * @dev Max supply of the token
     */
    uint256 public immutable maxSupply;

    /**
     * @dev Minter is the one who mints tokens per each block based on _stakerRewardPerBlock
     */
    address public minter;

    /**
     * @dev Admin of the contract - can mint tokens, change pendingAdmin and _stakerRewardPerBlock
     */
    address public admin;

    /**
     * @dev Pending admin can update the admin
     */
    address public pendingAdmin;

    /**
     * @dev Previous Minter emitted when replaced by new minter address
     */
    address public previousMinter;

    /**
     * @dev Previous Pending Admin emitted when replaced by new admin
     */
    address public previousPendingAdmin;

    /**
     * @dev Previous Admin emitted when replaced by new pending admin
     */
    address public previousAdmin;

    /**
     * @dev Event emitted when _stakerRewardPerBlock is updated by admin.
     * @param newStakerRewardPerBlock - this is the new _stakerRewardPerBlock value updated by admin.
     */
    event UpdateStakerRewardPerBlock(uint256 newStakerRewardPerBlock);

    /**
     * @dev Event emitted when setPendingAdmin is updated by admin.
     * @param previousPendingAdmin - the previous pendingAdmin value that was updated by admin
     * @param newPendingAdmin - the current pendingAdmin value that was added by admin
     */
    event SetPendingAdmin(address indexed previousPendingAdmin, address indexed newPendingAdmin);

    /**
     * @dev Event emitted when admin is updated - only pending admin can update.
     * @param previousAdmin - the previous admin value that was updated by pendingAdmin
     * @param newAdmin - the current admin value - this is usually the pendingAdmin value and only called by pendingAdmin to perform this function
     */
    event UpdateAdmin(address indexed previousAdmin, address indexed newAdmin);

    /**
     * @dev Event emitted when minted address is updated.
     * @param previousMinter - the address of previous minter
     * @param newMinter - the address of current minter
     */
    event UpdateMinter(address indexed previousMinter, address indexed newMinter);

    /**
     * @dev Restricts a function so it can only be executed by an admin role
     */
    modifier adminOnly() {
        require(msg.sender == admin, "Only admin can make this call");
        _;
    }

    /**
     * @dev Restricts a function so it can only be executed by a pending admin role
     */
    modifier pendingAdminOnly() {
        require(msg.sender == pendingAdmin, "Only pending admin can make this call");
        _;
    }

    /**
     * @dev Restricts a function so it can only be executed by a minter
     */
    modifier minterOnly() {
        require(msg.sender == minter, "Only minter can make this call");
        _;
    }

    /**
     * @dev Initializes the contract during deployment
     * @param name_ is the name of the token
     * @param symbol_ is the ticker symbol of the token
     * @param decimals_ set to 18 on deploy.
     * @param maxSupply_ is set to maxSupply of tokens allowed. The total supply of tokens should never exceed more than 1 billion
     * @param minter_ is the contract address of ValidatorStakeManager.
     * @param stakerRewardPerBlock_ will mint tokens based on stakerRewardPerBlock_ to reward the Subchain validator stakers.
     * @param initDistrWallet_ will hold the initial minted tokens
     * @param initMintAmount_ the initial mint tokens that will be held by initDistrWallet_
     * @param admin_ is the admin of the contract
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 maxSupply_,
        address minter_,
        uint256 stakerRewardPerBlock_,
        address initDistrWallet_,
        uint256 initMintAmount_,
        address admin_
    ) ERC20(name_, symbol_)
    {
        require(admin_ != address(0x0), "invalid admin address");
        require(minter_ != address(0x0), "invalid minter_ address");
        require(initDistrWallet_ != address(0x0), "invalid initDistrWallet_ address");
        require(decimals_ != 0, "invalid decimals");
        require(maxSupply_ != 0, "invalid maxSupply");
        require(maxSupply_ <= 10 ** 27, "maxSupply too large");
        require(
            initMintAmount_ < maxSupply_,
            "Initial supply too large"
        );
        _decimals = decimals_;
        maxSupply = maxSupply_;
        minter = minter_;
        _stakerRewardPerBlock = stakerRewardPerBlock_;
        admin = admin_;
        _mint(initDistrWallet_, initMintAmount_);
        emit UpdateMinter(previousMinter, minter);
        emit UpdateAdmin(previousAdmin, admin);
        emit UpdateStakerRewardPerBlock(_stakerRewardPerBlock);
    }

    /**
     * @dev This method allows the minter (e.g. the ValidatorStakeManager contract) to mint new tokens to reward, Minter is the ValidatorStakeManager contract.
     * @param account - account to which the staker amount and rewards will be minted
     * @param amount - amount that needs to be minted by the VSM
     * @return bool - This returns true - if the rewards are minted and false if they are not.
     */
    function mintStakerReward(address account, uint256 amount)
        external
        minterOnly
        returns (bool)
    {
        if (account == address(0x0)) {
            return false;
        }
        uint256 currentSupply = this.totalSupply();
        if (currentSupply >= maxSupply) {
            return false;
        }
        if (currentSupply.add(amount) > maxSupply) {
            amount = maxSupply.sub(currentSupply);
        }
        _mint(account, amount);
        return true;
    }

    /**
     * @dev This function allows admin to mint additional tokens.
     * @param amount - amount of tokens that will be minted by admin. They are minted to admin wallet.
     */
    function mint(uint256 amount) external adminOnly {
        require(msg.sender == admin, "only admin can mint");
        uint256 currentSupply = this.totalSupply();
        require(currentSupply <= maxSupply, "already exceeded max supply");
        require(currentSupply.add(amount) < maxSupply, "exceeded max supply of tokens" );
        _mint(admin, amount);
    }

    /**
     * @dev This function allows admin to update Staker reward per block
     * @notice This value will be cut in half based on the rules in per white paper.
     * @param stakerRewardPerBlock_ - Minter will mint tokens based on stakerRewardPerBlock_ to reward the Subchain validator stakers.
     */
    function updateStakerRewardPerBlock(uint256 stakerRewardPerBlock_)
        external
        adminOnly
    {
        _stakerRewardPerBlock = stakerRewardPerBlock_;
        emit UpdateStakerRewardPerBlock(_stakerRewardPerBlock);
    }

    /**
     * @dev This function updates Minter and can be called by admin only.
     * @param minter_ - The address of the minted contract this will be VSM - Validator Stake manager.
     */
    function updateMinter(address minter_) external adminOnly {
        require(minter_ != address(0x0), "invalid minter address");
        previousMinter = minter;
        minter = minter_;
        emit UpdateMinter(previousMinter, minter);
    }

    /**
     * @dev Pending admin is an intermediate role which is only used to update an admin
     * @param admin_ the address of the pending admin that needs to be set
     */
    function setPendingAdmin(address admin_) external adminOnly {
        require(admin_ != address(0x0), "invalid pending admin address");
        previousPendingAdmin = pendingAdmin;
        pendingAdmin = admin_;
        emit SetPendingAdmin(previousPendingAdmin, pendingAdmin);
    }

    /**
     * @dev This function updates admin - only invoked by pending admin
     */
    function updateAdmin() external pendingAdminOnly {
        previousAdmin = admin;
        admin = pendingAdmin;
        emit UpdateAdmin(previousAdmin, admin);
    }

    /**
     * @dev This method tells the minter - ValidatorStakeManager contract how many new tokens are minted per block for the Subchain validator stakers
     * @return Returns reward per block that gets minted by minter for stakers based on their staked amount.
     */
    function stakerRewardPerBlock() external view returns (uint256) {
        return _stakerRewardPerBlock;
    }

    /**
     * @dev Read only function for returning the decimals of token.
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}