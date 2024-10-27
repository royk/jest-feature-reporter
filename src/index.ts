import { BaseReporter } from '@jest/reporters';
import type {
  AggregatedResult,
  Test,
  TestResult,
  TestContext,
  AssertionResult
} from '@jest/test-result';
import type {Config } from '@jest/types';
import { XFeatureReporter, TestSuite as XTestSuite, TestResult as XTestResult } from 'x-feature-reporter';
import fs from 'fs';

export type ReporterOnStartOptions = {
  estimatedTime: number;
  showStatus: boolean;
  outputFile?: string;
};

class JestFeatureReporter extends BaseReporter {
  private readonly _globalConfig: Config.GlobalConfig;
  private readonly _options: ReporterOnStartOptions;
  private readonly _outputFile: string;
  private _suites: any[] = [];
  private _nestedLevel: number = 0;
  private _featureReporter: XFeatureReporter;

  
  // The constructor receives the globalConfig and options
  constructor(globalConfig: Config.GlobalConfig, options: ReporterOnStartOptions) {
    super();
    this._globalConfig = globalConfig;
    this._options = options;
    this._outputFile = options?.outputFile || 'FEATURES.md';
    this._featureReporter = new XFeatureReporter();
  }

  // This method is called when the entire test suite starts
  onRunStart( aggregatedResults: AggregatedResult,
    options: ReporterOnStartOptions,) {
    super.onRunStart(aggregatedResults, options);
    this._suites = [];
    this._nestedLevel = 0;
  }

  _groupTestsBySuites(testResults:Array<AssertionResult>) {
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
  onTestResult(
    _test?: Test,
    _testResult?: TestResult,
    _results?: AggregatedResult,
  ): void {
    
    
    const res = this._groupTestsBySuites(_testResult.testResults);
    res.suites.forEach(suite => {
      this._suites.push(suite);
    });
  }

  _getOutcome(test) {
    switch (test.status) {
      case 'skipped':
        return ':construction:';
      case 'passed':
        return ':white_check_mark:';
      case 'failed':
        return ':x:';
      case 'focused':
        return ':warning:';
    }
    return test.status;
  }

  _getTestType(test: AssertionResult) {
    const testTypeMatch = test.title.match(/^\[([^\]]+)\]/);
    return testTypeMatch ? testTypeMatch[1] : 'behavior';
  }

  _printSuite(suite: any) {
    const headerPrefix = '  '.repeat(this._nestedLevel) + '#'.repeat(this._nestedLevel+2);
    let stringBuilder = `${headerPrefix} ${suite.title}\n`;
    suite.suites && suite.suites.forEach(subSuite => {
      this._nestedLevel++;
      stringBuilder +=this._printSuite(subSuite);
      this._nestedLevel--;
    });
    suite.tests && suite.tests.forEach(test => {

      let testType = this._getTestType(test);
      if (testType!=='behavior') {
        return;
      }
      // remove test type from title
      const testTitle = test.title.replace(/^\[([^\]]+)\]/g, '').trim();
      stringBuilder += `- ${this._getOutcome(test)} ${testTitle}\n`;
    });
    return stringBuilder;
  }

  _convertSuiteToXFeatureReporter(suite) {
    const xSuite = {
      title: suite.title,
      suites: [],
      tests: [],
    } as XTestSuite;
    xSuite.suites = suite .suites.map((ss) => this._convertSuiteToXFeatureReporter(ss));
    xSuite.tests = suite.tests
    .map(t=> {
      let testType = this._getTestType(t);
      const title = t.title.replace(/^\[([^\]]+)\]/g, '').trim();
      return {
        title,
        status: t.status,
        testType,
      }
    })
    .filter(t => t.testType === 'behavior')
    .map(t => {
      return{
        title: t.title,
        status: t.status,
        testType: t.testType,
      } as XTestResult});
    return xSuite;
  }

  // This method is called when all test suites have finished
  onRunComplete(testContexts: Set<TestContext>,
    aggregatedResults: AggregatedResult,) {
    let stringBuilder = '';

    // this._suites.forEach(suite => {
    //   stringBuilder +=this._printSuite(suite);
    // });

    const rootSuite:XTestSuite = {
      title: 'Root',
      suites: [],
      tests: [],
      transparent: true
    };
    this._suites.forEach(suite => {
      rootSuite.suites.push(this._convertSuiteToXFeatureReporter(suite));
    });
    
    this._featureReporter.generateReport(this._outputFile, rootSuite, '');
  }
}

module.exports = JestFeatureReporter;
