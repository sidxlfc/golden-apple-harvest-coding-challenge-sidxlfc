"use strict";
import MinHeap from "./min-heap.js";

/**
 * This solution uses a min-heap to point to the next entry we want to print,
 * resulting in a total space complexity of O(N), where N == logSources.length.
 * 
 * Time complexity is O(log(N) * k), where N == logSources.length
 * and k == total number of entries across all log sources.
 */
// Print all entries, across all of the sources, in chronological order.
export const syncSortedMerge = (logSources, printer) => {

    // using a heap to store at the most `logSources.length` number of entries
    // heap is designed to be a min-heap based on "date", so it'll always point to the next entry we want to print
    const heap = new MinHeap();

    // Initialize the heap with the first entry from each log source
    for (let i = 0; i < logSources.length; i++) {
        const entry = logSources[i].pop();
        if (entry) {
            heap.insert({ date: entry.date, msg: entry.msg, sourceIndex: i });
        }
    }

    // look for the next entry from the heap
    while (!heap.isEmpty()) {
        const {date, msg, sourceIndex} = heap.remove();

        const newEntry = logSources[sourceIndex].pop();
        if (newEntry) {
            heap.insert({ date: newEntry.date, msg: newEntry.msg, sourceIndex });
        }
        printer.print({date, msg});
    }
    printer.done(logSources, "Sync sort complete.");
};