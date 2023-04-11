// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint public amount;
    bool public isDisputed;
    mapping (address => bool) public approved;
    mapping (address => bool) public signed;

    constructor(address _seller, address _arbiter) payable {
        require(msg.value > 0, "The value should be greater than zero");
        buyer = msg.sender;
        amount = msg.value;
        seller = _seller;
        arbiter = _arbiter;
    }

    modifier onlyParticipants {
        require(msg.sender == buyer || msg.sender == seller || msg.sender == arbiter, "Unauthorized. Only Participants are allowed");
        _;
    }

    modifier onlyParties {
        require(msg.sender == buyer || msg.sender == seller, "Unauthorized. Only Buyer or Seller are allowed");
        _;
    }

    modifier onlyArbitor {
        require(msg.sender == arbiter, "Unauthorized. Only Arbitor are allowed");
        _;
    }

    function approve() external onlyParties {
        require(!approved[msg.sender], "The sender has already approved the transaction.");
        approved[msg.sender] = true;
        if (approved[buyer] && approved[seller]) {
            signed[arbiter] = true;
            signed[buyer] = true;
            signed[seller] = true;
        }
    }

    function sign() external onlyParticipants {
        require(!signed[msg.sender], "The signer has already signed the transaction.");
        signed[msg.sender] = true;
    }

    function dispute() external onlyParties {
        require(!isApproved(), "The transaction has already been approved.");
        isDisputed = true;
    }

    function resolve() external onlyArbitor {
        require(isDisputed, "There is no dispute to resolve.");
        signed[buyer] = false;
        signed[seller] = false;
        payable(buyer).transfer(amount);
    }

    function release() external onlyParticipants {
        require(signed[arbiter], "The arbiter has not signed the transaction.");
        require(signed[buyer] && signed[seller], "The buyer and seller have not signed the transaction.");
        require(isApproved(), "The transaction has not been approved yet.");
        payable(seller).transfer(amount);
    }

    function isApproved() internal view returns(bool approval) {
        approval = approved[buyer] && approved[seller];
    }
}
