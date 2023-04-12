// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

enum States {
     PROPOSAL, 
     APPROVED,
     DISPUTE,
     RESOLVE,
     RELEASE
    }


contract Escrow {
    address public buyer;
    address public seller;
    address public arbiter;
    uint public amount;
    States public state;
    mapping (address => bool) public approved;
    mapping (address => bool) public signed;

    constructor(address _seller, address _arbiter) payable {
        require(msg.value > 0, "The value should be greater than zero");
        buyer = msg.sender;
        amount = msg.value;
        seller = _seller;
        arbiter = _arbiter;
        state = States.PROPOSAL;
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
        require(state == States.PROPOSAL, "Transaction Should be in proposal state.");
        require(!approved[msg.sender], "The sender has already approved the transaction.");
        approved[msg.sender] = true;
        if(approved[buyer] && approved[seller]){
            state = States.APPROVED;
        }
    }

    function signAndReleaseFund() external onlyParticipants {
        require(!signed[msg.sender], "The signer has already signed the transaction.");
        require(state == States.APPROVED, "Transaction Should be in approved state.");
        if(msg.sender == arbiter){
            require((signed[buyer] && signed[seller]), "The buyer and the seller needs to be signed");
        }
        signed[msg.sender] = true;
        if (signed[buyer] && signed[seller] && signed[arbiter]) {
            state = States.RELEASE;
            releaseAmountTo(seller);
        }
    }

    function dispute() external onlyParties {
        require(state == States.PROPOSAL, "The transaction state should be in proposal.");
        signed[msg.sender] = false;
        state = States.DISPUTE;
    }

    function resolve() external onlyArbitor {
        require(state == States.DISPUTE, "The transaction state should be in dispute.");
        state = States.RESOLVE;
        releaseAmountTo(buyer);
    }

    function releaseAmountTo(address _to) internal onlyParticipants {
        require(amount > 0, "No Amount to Release.");
        payable(_to).transfer(amount);
    }
}
