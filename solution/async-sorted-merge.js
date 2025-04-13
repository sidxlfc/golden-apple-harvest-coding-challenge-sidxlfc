"use strict";
import MinHeap from "./min-heap.js";

// Print all entries, across all of the *async* sources, in chronological order.

export const asyncSortedMerge = async(logSources, printer) => {

    const heap = new MinHeap();

    // Initialize the heap with the first entry from each log source
    for (let i = 0; i < logSources.length; i++) {
        const entry = await logSources[i].popAsync();
        if (entry) {
            heap.insert({ date: entry.date, msg: entry.msg, sourceIndex: i });
        }
    }

    // Process the heap until all log sources are drained
    while (!heap.isEmpty()) {
        const { date, msg, sourceIndex } = heap.remove();
        printer.print({ date, msg });

        // Fetch the next entry from the same log source
        const nextEntry = await logSources[sourceIndex].popAsync();
        if (nextEntry) {
            heap.insert({ date: nextEntry.date, msg: nextEntry.msg, sourceIndex });
        }
    }

    printer.done(logSources, "Async sort complete.");
};