"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const reporters_1 = require("@jest/reporters");
const fs_1 = __importDefault(require("fs"));
class JestFeatureReporter extends reporters_1.BaseReporter {
    // The constructor receives the globalConfig and options
    constructor(globalConfig, options) {
        super();
        this._suites = [];
        this._globalConfig = globalConfig;
        this._options = options;
        this._outputFile = (options === null || options === void 0 ? void 0 : options.outputFile) || 'FEATURES.md';
    }
    // This method is called when the entire test suite starts
    onRunStart(aggregatedResults, options) {
        super.onRunStart(aggregatedResults, options);
    }
    _groupTestsBySuites(testResults) {
        const root = {
            suites: [],
            tests: [],
            title: ''
        };
        testResults.forEach(testResult => {
            let targetSuite = root;
            // Find the target suite for this test,
            // creating nested suites as necessary.
            for (const title of testResult.ancestorTitles) {
                let matchingSuite = targetSuite.suites.find(s => s.title === title);
                if (!matchingSuite) {
                    matchingSuite = {
                        suites: [],
                        tests: [],
                        title
                    };
                    targetSuite.suites.push(matchingSuite);
                }
                targetSuite = matchingSuite;
            }
            targetSuite.tests.push(testResult);
        });
        return root;
    }
    // This method is called after a single test suite completes
    onTestResult(_test, _testResult, _results) {
        const res = this._groupTestsBySuites(_testResult.testResults);
        res.suites.forEach(suite => {
            this._suites.push(suite);
        });
    }
    // This method is called when all test suites have finished
    onRunComplete(testContexts, aggregatedResults) {
        let stringBuilder = '';
        this._suites.forEach(suite => {
            stringBuilder += `## ${suite.title}\n\n`;
            suite.tests && suite.tests.forEach(test => {
                stringBuilder += `- ${test.title}\n`;
            });
        });
        fs_1.default.writeFileSync(this._outputFile, stringBuilder);
    }
}
module.exports = JestFeatureReporter;
