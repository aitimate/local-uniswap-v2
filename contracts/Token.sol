// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol)  {
        _mint(msg.sender, 1000000000000000000000000);
        _mint(0x0000000000000000000000000000000000001004, 1000000000000000000000000);
    }
}