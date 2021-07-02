//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.6;

import {DappToken} from "./DappToken.sol";
import {DaiToken} from "./DaiToken.sol";

contract TokenFarm {
    string public name = "Token Farm";
    DappToken public dappToken;
    DaiToken public daiToken;

    constructor(DappToken _dappToken, DaiToken _daiToken) {
        dappToken = _dappToken;
        daiToken = _daiToken;
    }
}
