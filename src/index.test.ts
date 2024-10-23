import fs from 'fs';
import { Reporter } from '@jest/reporters';
import type {TestResult} from '@jest/test-result';
const JestFeatureReporter = require('./index').default || require('./index');

jest.mock('fs');

const testResultBase: TestResult = {
  testFilePath: 'sample.test.js',
      leaks: false,
      numFailingTests: 0,
      numPassingTests: 1,
      numPendingTests: 0,
      numTodoTests: 0,
      openHandles: [],
      perfStats: {
        end: 0,
        runtime: 0,
        slow: false,
        start: 0
      },
      skipped: false,
      snapshot: {
        added: 0,
        fileDeleted: false,
        matched: 0,
        unchecked: 0,
        uncheckedKeys: [],
        unmatched: 0,
        updated: 0
      },
      testResults: []
    };
// sample.test.js
describe("JestFeatureReporter", () => {
describe('Features', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("Describe blocks appear as headings. Nested describe blocks are nested headings", () => {
    const reporter: Reporter = new JestFeatureReporter({}, {});
    // @ts-ignore
    reporter.onRunStart({}, {});
    const featureTitle = "Features";
    const subfeatureTitle = "Subfeature";
    const passingEmoji = "✅";

    const caseTitle = "Write to file";
    const testResult: TestResult = JSON.parse(JSON.stringify(testResultBase)); // This creates a deep copy
    testResult.testResults.push({
      ancestorTitles: [featureTitle, subfeatureTitle],
      failureDetails: [],
      failureMessages: [],
      status: "passed",
      title: caseTitle,
      fullName: caseTitle,
      numPassingAsserts: 1
    });
    // @ts-ignore
    reporter.onTestResult(null, testResult, null);
    // @ts-ignore
    reporter.onRunComplete(null,
      null
    );
    const expectedOutput = `## ${featureTitle}\n  ### ${subfeatureTitle}\n- ${caseTitle}\n`;
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expectedOutput);
  });
  it('writes results as markdown', () => {
    const reporter: Reporter = new JestFeatureReporter({}, {});
    // @ts-ignore
    reporter.onRunStart({}, {});
    const suiteName = "Features";
    const testName = "Write to file";
    const testResult: TestResult = JSON.parse(JSON.stringify(testResultBase));
    testResult.testResults.push({
      ancestorTitles: [suiteName],
      failureDetails: [],
      failureMessages: [],
      status: "passed",
      title: testName,
      fullName: testName,
      numPassingAsserts: 1
    });
    // @ts-ignore
    reporter.onTestResult(null, testResult, null);
    // @ts-ignore
    reporter.onRunComplete(null,
      null
    );
    const expectedOutput = `## ${suiteName}\n- ${testName}\n`;
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expectedOutput);
  });

  });
});