#!/usr/bin/env zx

import fetch from "node-fetch";

import { runSolution } from "./runSolution.js";

const SESO_GRADING_SERVER_HOST = process.env.SESO_GRADING_SERVER_HOST || "http://localhost:2024";
const SERVER_URL = `${SESO_GRADING_SERVER_HOST}/grade/golden-apple-harvest`;
const REPOSITORY = process.env.REPOSITORY || "sesolabor-interviews/golden-apple-harvest-coding-challenge-clickclickonsal";
const PULL_REQUEST_NUMBER = process.env.PULL_REQUEST_NUMBER || "1";
const RUN_NUMBER = process.env.RUN_NUMBER || "0";
const RUN_ID = process.env.RUN_ID || "000000";
const CODING_CHALLENGE_API_SECRET = process.env.CODING_CHALLENGE_API_SECRET;
const CODING_CHALLENGE_ASYNC_ITERATIONS = process.env.CODING_CHALLENGE_ASYNC_ITERATIONS || '100,1000';
const CODING_CHALLENGE_SYNC_ITERATIONS = process.env.CODING_CHALLENGE_SYNC_ITERATIONS || '100,1000';


const syncIterations = CODING_CHALLENGE_SYNC_ITERATIONS.split(',').map(Number);
const asyncIterations = CODING_CHALLENGE_ASYNC_ITERATIONS.split(',').map(Number);

const generateResults = async () => {
  const results = [];

  for (const iteration of syncIterations) {
    results.push(await runSolution('sync', iteration));
  }

  for (const iteration of asyncIterations) {
    results.push(await runSolution('async', iteration));
  }

  return results;
};

const results = await generateResults();

async function sendCombinedResults() {
  const jsonPayload = {
    results,
    githubContext: {
      repositoryURL: REPOSITORY,
      pullRequestNumber: PULL_REQUEST_NUMBER,
      runNumber: RUN_NUMBER,
      runId: RUN_ID,
    },
  };

  console.log("⚾️ Sending the result to the server...");

  try {
    const response = await fetch(SERVER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CODING_CHALLENGE_API_SECRET}`,
      },
      body: JSON.stringify(jsonPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send data: ${response.status} - ${response.statusText}`);
    }

    const responseBody = await response.text();
    console.log("🫴 Server response:", responseBody);
  } catch (error) {
    console.error("❌ Failed to send results to server:", error.message);
  }
}

await sendCombinedResults();

process.exit(0);
