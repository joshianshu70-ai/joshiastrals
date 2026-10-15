// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {ERC721SeaDrop} from "./vendor/seadrop/src/ERC721SeaDrop.sol";

/// @notice OpenSea Drop candidate. Inherits the official minting implementation unchanged.
/// @dev Metadata, payout, stages and fee recipient must be configured before launch.
contract JoshiAstralsSeaDrop is ERC721SeaDrop {
    address public constant HOUSE_WALLET = 0x6736d2eA9807297F0e56967361B9410854B86a5f;

    constructor(address seaDrop) ERC721SeaDrop("Joshi Astrals", "ASTRAL", _allowed(seaDrop)) {
        require(seaDrop.code.length > 0, "SeaDrop must be deployed");
        _maxSupply = 7777;
        _royaltyInfo = RoyaltyInfo(HOUSE_WALLET, 700);
        _transferOwnership(HOUSE_WALLET);
        emit MaxSupplyUpdated(7777);
        emit RoyaltyInfoUpdated(HOUSE_WALLET, 700);
    }

    function _allowed(address seaDrop) private pure returns (address[] memory allowed) {
        allowed = new address[](1);
        allowed[0] = seaDrop;
    }
}
