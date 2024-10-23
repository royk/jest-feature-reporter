import { BaseReporter } from '@jest/reporters';
import type {
  AggregatedResult,
  Test,
  TestResult,
  TestContext
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

  // This method is called after a single test suite completes
  onTestResult(
    _test?: Test,
    _testResult?: TestResult,
    _results?: AggregatedResult,
  ): void {
  }

  // This method is called when all test suites have finished
  onRunComplete(testContexts: Set<TestContext>,
    aggregatedResults: AggregatedResult,) {
    let stringBuilder = '';
    stringBuilder += `# Features\n\n`;
    stringBuilder += `Total Tests Run: ${aggregatedResults.numTotalTests}\n`;
    stringBuilder += `Total Passed: ${aggregatedResults.numPassedTests}\n`;
    stringBuilder += `Total Failed: ${aggregatedResults.numFailedTests}\n`;
    fs.writeFileSync(this._outputFile, stringBuilder);
  }
}

module.exports = JestFeatureReporter;
