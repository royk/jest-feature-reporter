"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reporters_1 = require("@jest/reporters");
const fs_1 = __importDefault(require("fs"));
class CustomReporter extends reporters_1.BaseReporter {
    // The constructor receives the globalConfig and options
    constructor(globalConfig, options) {
        super();
        this._globalConfig = globalConfig;
        this._options = options;
        this._outputFile = options.outputFile || 'FEATURES.md';
    }
    // This method is called when the entire test suite starts
    onRunStart(aggregatedResults, options) {
        super.onRunStart(aggregatedResults, options);
    }
    // This method is called after a single test suite completes
    onTestResult(_test, _testResult, _results) {
    }
    // This method is called when all test suites have finished
    onRunComplete(testContexts, aggregatedResults) {
        let stringBuilder = '';
        stringBuilder += `# Features\n\n`;
        stringBuilder += `Total Tests Run: ${aggregatedResults.numTotalTests}\n`;
        stringBuilder += `Total Passed: ${aggregatedResults.numPassedTests}\n`;
        stringBuilder += `Total Failed: ${aggregatedResults.numFailedTests}\n`;
        fs_1.default.writeFileSync(this._outputFile, stringBuilder);
    }
}
module.exports = CustomReporter;
