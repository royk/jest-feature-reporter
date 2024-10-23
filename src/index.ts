import { BaseReporter } from '@jest/reporters';
import type {
  AggregatedResult,
  Test,
  TestResult,
  TestContext
} from '@jest/test-result';
import type {Config } from '@jest/types';

export type ReporterOnStartOptions = {
  estimatedTime: number;
  showStatus: boolean;
};

class CustomReporter extends BaseReporter {
  private readonly _globalConfig: Config.GlobalConfig;
  private readonly _options: ReporterOnStartOptions;
  // The constructor receives the globalConfig and options
  constructor(globalConfig: Config.GlobalConfig, options: ReporterOnStartOptions) {
    super();
    this._globalConfig = globalConfig;
    this._options = options;
  }

  // This method is called when the entire test suite starts
  onRunStart( aggregatedResults: AggregatedResult,
    options: ReporterOnStartOptions,) {
    super.onRunStart(aggregatedResults, options);
    console.log('Test run started');
  }

  // This method is called after a single test suite completes
  onTestResult(
    _test?: Test,
    _testResult?: TestResult,
    _results?: AggregatedResult,
  ): void {
    console.log(`Finished test file: ${_test?.path}`);
    console.log(`Total Tests: ${_testResult?.numPassingTests}`);
    console.log(`Total Failed: ${_testResult?.numFailingTests}`);
  }

  // This method is called when all test suites have finished
  onRunComplete(testContexts: Set<TestContext>,
    aggregatedResults: AggregatedResult,) {
    console.log('All tests completed');
    console.log(`Total Tests Run: ${aggregatedResults.numTotalTests}`);
    console.log(`Total Passed: ${aggregatedResults.numPassedTests}`);
    console.log(`Total Failed: ${aggregatedResults.numFailedTests}`);
  }
}

module.exports = CustomReporter;
