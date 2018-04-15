'use strict';

var assert = require('assert');

var tools = require('ethers-cli');


// We use the exact same deployment script for our test cases as we use to
// actually deploy the contract.
var deployContract = require('./deploy-contract');

// If "beforeEach", "describe" and "it" are unfamiliar to you, please check
// out the Mocha documentation: https://mochajs.org


var builder = null;
beforeEach(function() {

    // Compiling the Solidity source and setting up an ephemeral testnet
    // can take more than the 2 seconds Mocha uses by default
    this.timeout(120000);

    // Create a new TestBuilder, which creates a brand new blockchain to work with
    builder = new tools.TestBuilder(deployContract);

    // Execute the deploy function passed into the TestBuilder
    return builder.deploy();
});


describe('Basic Testing', function() {

    it('Sets and Gets a value', function () {

        // These testcases can take a while
        this.timeout(120000);

        // Our deployContract function returned a reference to the deployed
        // contract, which has the Signer attached to it that was used to
        // deploy it; i.e. builder.accounts[0]
        var contract = builder.deployed;

        var contractAccount1 = contract.connect(builder.accounts[1]);
        var contractReadOnly = contract.connect(builder.provider);

        var initialValue = "First!!1";
        var newValue = "Hello World!"

        var seq = Promise.resolve();

        // Set up an event listener to test the event
        var testEvent = new Promise(function(resolve, reject) {
            contractReadOnly.onvaluechanged = function(author, oldValue, value) {
                // Remove the listener, otherwise the test case cannot exit (think unref)
                this.removeListener();

                assert.equal(author, builder.accounts[1].address, 'correct author attributed in event');
                assert.equal(oldValue, initialValue, 'old value is the initial string in event');
                assert.equal(value, newValue, 'new value matches updated value in event');

                // This testcase can resolve (
                resolve();
            };
        });

        // Get the initial value
        seq = seq.then(function() {
            return contractReadOnly.value().then(function(value) {
                assert.equal(value, initialValue, 'initial value is the empty string');
            });
        });

        // Set the new value
        seq = seq.then(function() {
            return contractAccount1.setValue(newValue).then(function(tx) {
                return builder.provider.waitForTransaction(tx.hash);
            });
        });

        // Verify the new value
        seq = seq.then(function() {
            return contractReadOnly.value().then(function(value) {
                assert.equal(value, newValue, 'new value matches updated value');
            });
        });

        // Wait for the event test to resolve
        seq = seq.then(function() {
            return testEvent;
        });

        return seq;
    });
});
