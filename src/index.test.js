import fs from 'fs';
import JestFeatureReporter from './index';

// mock writing to file
jest.mock('fs');

// sample.test.js
describe('Features', () => {
  it('writes to file', () => {
    const reporter = new JestFeatureReporter();
    reporter.onRunStart();
    reporter.onRunComplete(null,
      {
        numTotalTests: 1,
        numPassedTests: 1,
        numFailedTests: 0
      }
    );
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

});
