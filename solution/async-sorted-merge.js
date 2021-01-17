"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

export const asyncSortedMerge = (logSources, printer) => {
  return new Promise((resolve, reject) => {
    printer.done(logSources, "Async sort complete.");
    resolve();
  });
};
