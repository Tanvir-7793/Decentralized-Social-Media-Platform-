// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DeployHelpers.s.sol";
import "../contracts/Social.sol";

contract DeploySocial is ScaffoldETHDeploy {
    function run() external ScaffoldEthDeployerRunner {
        Social social = new Social();
        console.logString(string.concat("Social deployed at: ", vm.toString(address(social))));
        deployments.push(Deployment({name: "Social", addr: address(social)}));
    }
}