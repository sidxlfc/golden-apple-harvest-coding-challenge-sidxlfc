"use strict";

import { $ } from "zx";

const TIME_LIMIT_IN_MINUTES = 15;
const TIME_LIMIT_IN_MILLISECONDS = TIME_LIMIT_IN_MINUTES * 60 * 1000;
const timeoutMessage = "Timeout exceeded";

let didLastRunFail = false;
const timeout = (ms) => new Promise((_, reject) => {
  setTimeout(() => {
    didLastRunFail = true;
    reject(new Error(timeoutMessage));
  }, ms);
});

const parseCodingChallenegeOutput = (output, limit = 100) => {
  try {
    const parsed = JSON.parse(output);
    return typeof parsed === "object" && parsed !== null ? parsed : { truncated: output.slice(0, limit) };
  } catch {
    // If parsing fails, return a fallback object with truncated string
    return { truncated: String(output).slice(0, limit) };
  }
};

export const runSolution = async (solutionType, logSourcesCount) => {
  console.log(`Running ${solutionType} solution`);

  const start = Date.now();

  try {
    if (didLastRunFail) {
      throw new Error("Skipped due to prior test timeout");
    }

    const { stdout } = await Promise.race([
      $`RUN_ONLY=${solutionType} LOG_LEVEL=info LOG_SOURCE_COUNT=${logSourcesCount} node index.js`,
      timeout(TIME_LIMIT_IN_MILLISECONDS),
    ]);
    const elapsedTime = Math.round((Date.now() - start) / 1000);
    const output = parseCodingChallenegeOutput(stdout.trim());

    const result = {
      logSources: logSourcesCount,
      elapsedTime,
      output,
      status: "pass",
      type: solutionType,
    };

    return result;
  } catch (error) {
    const elapsedTime = Math.round((Date.now() - start) / 1000);

    const output = error.message === timeoutMessage
        ? { truncated: `Test timed out after ${TIME_LIMIT_IN_MINUTES} minutes` }
        : parseCodingChallenegeOutput(error.stderr?.trim() || error.message);

    const result = {
      logSources: logSourcesCount,
      elapsedTime,
      output,
      status: "fail",
      type: solutionType,
    };

    return result;
  }
};
