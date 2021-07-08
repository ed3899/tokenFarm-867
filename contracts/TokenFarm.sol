//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.6;

import {DappToken} from "./DappToken.sol";
import {DaiToken} from "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stakes Tokens (Deposit)
    function stakeTokens(uint256 _amount) public {
        // Require amount greater than 0
        require(_amount > 0, "Amount cannot be 0");

        // Transfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] += _amount;

        // Add user to stakers array *only* if they haven't staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        // Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //2. Unstaking Tokens (Withdraw)

    //3. Issuing tokens
    function issueTokens() public {
        //Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        //Issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
