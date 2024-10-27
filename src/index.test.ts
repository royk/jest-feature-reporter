import fs from 'fs';
import { Reporter } from '@jest/reporters';
import type {TestResult} from '@jest/test-result';
const JestFeatureReporter = require('./index').default || require('./index');

jest.mock('fs');

const passingEmoji = ':white_check_mark:';
const failingEmoji = ':x:';
const skippedEmoji = ':construction:';

const featureTitle = "Features";
const subfeatureTitle = "Subfeature";

const caseTitle = "Feature one";
const caseTitle2 = "Feature two";

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
      const expectedOutput = `\n## ${featureTitle}\n  ### ${subfeatureTitle}\n  - ${passingEmoji} ${caseTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expectedOutput);
    });
    it(`Tests appear as list items representing features. Each feature is visually marked as Passing ${passingEmoji}, Failing ${failingEmoji} or Skipped ${skippedEmoji}`, () => {
      const reporter: Reporter = new JestFeatureReporter({}, {});
      // @ts-ignore
      reporter.onRunStart({}, {});
      const testResult: TestResult = JSON.parse(JSON.stringify(testResultBase)); // This creates a deep copy
      testResult.testResults.push({
        ancestorTitles: [featureTitle],
        failureDetails: [],
        failureMessages: [],
        status: "failed",
        title: caseTitle,
        fullName: caseTitle,
        numPassingAsserts: 1
      });
      testResult.testResults.push({
        ancestorTitles: [featureTitle],
        failureDetails: [],
        failureMessages: [],
        status: "skipped",
        title: caseTitle2,
        fullName: caseTitle2,
        numPassingAsserts: 1
      });
      // @ts-ignore
      reporter.onTestResult(null, testResult, null);
      // @ts-ignore
      reporter.onRunComplete(null,
        null
      );
      const expectedMarkdown = `\n## ${featureTitle}\n- ${failingEmoji} ${caseTitle}\n- ${skippedEmoji} ${caseTitle2}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expectedMarkdown);
    });
    it("Tests can be prefixed with [test-type]. [behavior] tests appear as features. Unprefixed tests are assumed to be behavioral.", () => {
      const reporter: Reporter = new JestFeatureReporter({}, {});
      // @ts-ignore
      reporter.onRunStart({}, {});
      const behaviorPrefix = "[behavior]";
      const edgeCasePrefix = "[edge-case]";
      const testResult: TestResult = JSON.parse(JSON.stringify(testResultBase)); // This creates a deep copy
      testResult.testResults.push({
        ancestorTitles: [featureTitle],
        failureDetails: [],
        failureMessages: [],
        status: "passed",
        title: `${behaviorPrefix} ${caseTitle}`,
        fullName: `${behaviorPrefix} ${caseTitle}`,
        numPassingAsserts: 1
      });
      testResult.testResults.push({
        ancestorTitles: [featureTitle],
        failureDetails: [],
        failureMessages: [],
        status: "passed",
        title: `${edgeCasePrefix} ${caseTitle2}`,
        fullName: `${edgeCasePrefix} ${caseTitle2}`,
        numPassingAsserts: 1
      });
      // @ts-ignore
      reporter.onTestResult(null, testResult, null);
      // @ts-ignore
      reporter.onRunComplete(null,
        null
      );
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expectedMarkdown);
    });
    it('[edge-case] test types are only extracted from the beginning of the title', () => {
      const reporter: Reporter = new JestFeatureReporter({}, {});
      // @ts-ignore
      reporter.onRunStart({}, {});
      const edgeCasePrefix = "[edge-case]";
      const testResult: TestResult = JSON.parse(JSON.stringify(testResultBase)); // This creates a deep copy
      testResult.testResults.push({
        ancestorTitles: [featureTitle],
        failureDetails: [],
        failureMessages: [],
        status: "passed",
        title: `${caseTitle} ${edgeCasePrefix}`,
        fullName: `${caseTitle} ${edgeCasePrefix}`,
        numPassingAsserts: 1
      });
      // @ts-ignore
      reporter.onTestResult(null, testResult, null);
      // @ts-ignore
      reporter.onRunComplete(null,
        null
      );
      const expectedMarkdown = `\n## ${featureTitle}\n- ${passingEmoji} ${caseTitle} ${edgeCasePrefix}\n`;
      expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), expectedMarkdown);
    });
  });
});