"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingPlaceholder = void 0;
const reporters_1 = require("@jest/reporters");
const x_feature_reporter_1 = require("x-feature-reporter");
const { MarkdownAdapter, MarkdownAdapterOptions } = require('x-feature-reporter/adapters/markdown');
exports.embeddingPlaceholder = 'jest-feature-reporter';
class JestFeatureReporter extends reporters_1.BaseReporter {
    // The constructor receives the globalConfig and options
    constructor(globalConfig, options) {
        super();
        this._suites = [];
        this._outputFile = (options === null || options === void 0 ? void 0 : options.outputFile) || 'FEATURES.md';
    }
    // This method is called when the entire test suite starts
    onRunStart(aggregatedResults, options) {
        super.onRunStart(aggregatedResults, options);
        this._suites = [];
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
    _getTestType(test) {
        // TODO:
        // change format to [type:behavior]
        const testTypeMatch = test.title.match(/^\[([^\]]+)\]/);
        return testTypeMatch ? testTypeMatch[1] : 'behavior';
    }
    _convertSuiteToXFeatureReporter(suite) {
        const xSuite = {
            title: suite.title,
            suites: [],
            tests: [],
        };
        xSuite.suites = suite.suites.map((ss) => this._convertSuiteToXFeatureReporter(ss));
        xSuite.tests = suite.tests
            .map(t => {
            let testType = this._getTestType(t);
            const title = t.title.replace(/^\[([^\]]+)\]/g, '').trim();
            return {
                title,
                status: t.status,
                testType,
            };
        })
            .filter(t => t.testType === 'behavior')
            .map(t => {
            return {
                title: t.title,
                status: t.status,
                testType: t.testType,
            };
        });
        return xSuite;
    }
    onRunComplete(testContexts, aggregatedResults) {
        const rootSuite = {
            title: 'Root',
            suites: [],
            tests: [],
            transparent: true
        };
        this._suites.forEach(suite => {
            rootSuite.suites.push(this._convertSuiteToXFeatureReporter(suite));
        });
        const reporter = new x_feature_reporter_1.XFeatureReporter(new MarkdownAdapter({
            outputFile: this._outputFile,
            embeddingPlaceholder: exports.embeddingPlaceholder
        }));
        reporter.generateReport(rootSuite);
    }
}
module.exports = JestFeatureReporter;
