"use strict";
import MinHeap from "./min-heap.js";

// Print all entries, across all of the *async* sources, in chronological order.

export const asyncSortedMerge = async(logSources, printer) => {

    const heap = new MinHeap();
    // initialize the promises buffer
    const promises = new Array(logSources.length);

    // Initialize the heap with the first entry from each log source
    for (let i = 0; i < logSources.length; i++) {
        const entry = await logSources[i].popAsync();
        if (entry) {
            heap.insert({ date: entry.date, msg: entry.msg, sourceIndex: i });
        }
        // Initialize the promises buffer with the next popAsync call
        promises[i] = logSources[i].popAsync();
    }

    // Consumer: Process the heap until all sources are drained
    while (!heap.isEmpty()) {
        
        const {date, msg, sourceIndex} = heap.remove();
        printer.print({date, msg});

        const nextEntry = await promises[sourceIndex];
        if (nextEntry) {
            heap.insert({ date: nextEntry.date, msg: nextEntry.msg, sourceIndex });
            // Fetch the next entry for this source and update the promises buffer
            promises[sourceIndex] = logSources[sourceIndex].popAsync();
        } else {
            promises[sourceIndex] = null; // Mark this source as drained
        }
    }

    printer.done(logSources, "Async sort complete.");
};