//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployYourContract } from "./DeployYourContract.s.sol";
import { DeploySocial } from "./DeploySocial.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        DeployYourContract deployYourContract = new DeployYourContract();
        deployYourContract.run();

        DeploySocial deploySocial = new DeploySocial();
        deploySocial.run();
    }
}