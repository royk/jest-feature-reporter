"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reporters_1 = require("@jest/reporters");
class CustomReporter extends reporters_1.BaseReporter {
    // The constructor receives the globalConfig and options
    constructor(globalConfig, options) {
        super();
        this._globalConfig = globalConfig;
        this._options = options;
    }
    // This method is called when the entire test suite starts
    onRunStart(aggregatedResults, options) {
        super.onRunStart(aggregatedResults, options);
        console.log('Test run started');
    }
    // This method is called after a single test suite completes
    onTestResult(_test, _testResult, _results) {
        console.log(`Finished test file: ${_test === null || _test === void 0 ? void 0 : _test.path}`);
        console.log(`Total Tests: ${_testResult === null || _testResult === void 0 ? void 0 : _testResult.numPassingTests}`);
        console.log(`Total Failed: ${_testResult === null || _testResult === void 0 ? void 0 : _testResult.numFailingTests}`);
    }
    // This method is called when all test suites have finished
    onRunComplete(testContexts, aggregatedResults) {
        console.log('All tests completed');
        console.log(`Total Tests Run: ${aggregatedResults.numTotalTests}`);
        console.log(`Total Passed: ${aggregatedResults.numPassedTests}`);
        console.log(`Total Failed: ${aggregatedResults.numFailedTests}`);
    }
}
module.exports = CustomReporter;
