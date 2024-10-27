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

  _getTestType(test: AssertionResult) {
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

  onRunComplete(testContexts: Set<TestContext>,
    aggregatedResults: AggregatedResult,) {
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
