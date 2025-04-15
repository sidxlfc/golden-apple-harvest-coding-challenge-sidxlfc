"use strict";
import MinHeap from "./min-heap.js";

// Print all entries, across all of the *async* sources, in chronological order.

export const asyncSortedMerge = async(logSources, printer) => {

    const heap = new MinHeap();

    // Producer: Fetch entries from log sources concurrently
    const fetchEntries = async (source, index) => {
        while (true) {
            const entry = await source.popAsync();
            if (entry) {
                // Insert the entry into the heap
                heap.insert({ date: entry.date, msg: entry.msg, sourceIndex: index });   
            }
        }
    };

    // Start fetching from all log sources concurrently
    await Promise.all(logSources.map((source, index) => fetchEntries(source, index)));

    // Consumer: Process the heap until all sources are drained
    while (!heap.isEmpty()) {
        const { date, msg } = heap.remove();
        printer.print({ date, msg });
    }

    printer.done(logSources, "Async sort complete.");
};