import fs from 'fs';
import JestFeatureReporter from './index';

// mock writing to file
jest.mock('fs');

// sample.test.js
describe('Features', () => {
  it('writes results as markdown', () => {
    const reporter = new JestFeatureReporter();
    reporter.onRunStart();
    const suiteName = "Features";
    const testName = "Write to file";
    const testResult = {
      testFilePath: 'sample.test.js',
      testResults: [{
        ancestorTitles: [suiteName],
        failureDetails: [],
        failureMessages: [],
        status: "passed",
        title: testName
      }]
    };
    reporter.onTestResult(null, testResult, null);
    reporter.onRunComplete(null,
      null
    );
    const expectedOutput = `## ${suiteName}\n\n- ${testName}\n`;
    expect(fs.writeFileSync).toHaveBeenCalledWith('FEATURES.md', expectedOutput);
  });

});
