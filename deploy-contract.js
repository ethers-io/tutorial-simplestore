'use strict';

module.exports = function(builder) {

    // Compile the SimpleStore.sol Solidity contract with optimizations enabled
    var codes = builder.compile('./SimpleStore.sol', true);

    // A Solidity file can contain multiple contracts, so we need to select
    // the specific contract code object
    var code = codes.SimpleStore;

    // Deploy the contract
    return code.deploy().then(function(contract) {

        // Save the contract details to disk
        builder.saveContract('simple-store.json', contract);

        // By returning the contract we simplify our test cases, which will
        // use this deploy-contract JavaScript file to deploy the contract
        // to a short-lived fake Ethereum network, which is destoryed and
        // recreated between each test case.
        return contract;
    });
};
