//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.6;

import {DappToken} from "./DappToken.sol";
import {DaiToken} from "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;

    constructor(DappToken _dappToken, DaiToken _daiToken) {
        dappToken = _dappToken;
        daiToken = _daiToken;
    }

    //1. Stakes Tokens (Deposit)
    function stakeTokens(uint256 _amount) public {
        // Transfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        // Update staking balance
        stakingBalance[msg.sender] += _amount;

        // Add user to stakers array *only* if they haven't staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
    }
    //2. Unstaking Tokens (Withdraw)
    //3. Issuing tokens
}
