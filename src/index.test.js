import fs from 'fs';
import JestFeatureReporter from './index';

// mock writing to file
jest.mock('fs');

// sample.test.js
describe('Features', () => {
  it('writes to file', () => {
    const reporter = new JestFeatureReporter();
    reporter.onRunStart();
    const testResult = {
      testFilePath: 'sample.test.js',
      testResults: [{
        "ancestorTitles": ["Features"],
        "fullName": "Write to file",
        "failureDetails": [],
        "failureMessages": [],
        "status": "passed",
        "title": "Write to file"
      }]
    };
    reporter.onTestResult(null, testResult, null);
    reporter.onRunComplete(null,
      null
    );
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

});
