import { BaseReporter } from '@jest/reporters';
import type {
  AggregatedResult,
  Test,
  TestResult,
  TestContext,
  AssertionResult
} from '@jest/test-result';
import type {Config } from '@jest/types';
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

  
  // The constructor receives the globalConfig and options
  constructor(globalConfig: Config.GlobalConfig, options: ReporterOnStartOptions) {
    super();
    this._globalConfig = globalConfig;
    this._options = options;
    this._outputFile = options?.outputFile || 'FEATURES.md';
  }

  // This method is called when the entire test suite starts
  onRunStart( aggregatedResults: AggregatedResult,
    options: ReporterOnStartOptions,) {
    super.onRunStart(aggregatedResults, options);
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
    console.log(JSON.stringify(_testResult));
    res.suites.forEach(suite => {
      this._suites.push(suite);
    });
  }

  // This method is called when all test suites have finished
  onRunComplete(testContexts: Set<TestContext>,
    aggregatedResults: AggregatedResult,) {
    let stringBuilder = '';

    this._suites.forEach(suite => {
      stringBuilder += `## ${suite.title}\n\n`;
      suite.tests && suite.tests.forEach(test => {
        stringBuilder += `- ${test.title}\n`;
      });
    });
    fs.writeFileSync(this._outputFile, stringBuilder);
  }
}

module.exports = JestFeatureReporter;
