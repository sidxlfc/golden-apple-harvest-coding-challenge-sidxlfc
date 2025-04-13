"use strict";
import MinHeap from "./min-heap.js";

// Print all entries, across all of the *async* sources, in chronological order.

export const asyncSortedMerge = (logSources, printer) => {

    // using a heap to store at the most `logSources.length` number of entries
    // heap is designed to be a min-heap based on "date", so it'll always point to the next entry we want to print
    const heap = new MinHeap();
    // map to help us lookup which `logSource` an entry in the heap belongs to.
    // This also stores `logSources.length` number of keys at the most
    const entryToLogSourceMap = new Map();

    // function to generate a string ID to enable storing entries into a map based on their ID as a key
    function generateEntryId(entry) {
        // adding "random" salt to account for cases where 2 entries have the same `msg` and `date` (collision)
        const random = Math.floor(Math.random() * 100);
        return `${entry.msg}${entry.date}${random}`;
    }

    // initializing an array of promises for the first log entry of each source
    const promises = new Array();
    for (const logSource of logSources) {
        promises.push(logSource.popAsync());
    }

    // resolve all promises, then put them in the heap and initialize the map
    Promise.all(promises).then(async(entries) => {
        entries.forEach((entry, index) => {
            if (entry) {
                entry.id = generateEntryId(entry);
                heap.insert(entry);
                entryToLogSourceMap.set(entry.id, logSources[index]);
            }
        });

        // this part has to be done synchronously because we don't know
        // if the next entry from this log source is the one we want to print next
        while (!heap.isEmpty()) {
            const currEntry = heap.remove();
            const currLogSource = entryToLogSourceMap.get(currEntry.id);
            entryToLogSourceMap.delete(currEntry.id);

            const newEntry = await currLogSource.popAsync();
            if (newEntry) {
                newEntry.id = generateEntryId(newEntry);
                heap.insert(newEntry);
                entryToLogSourceMap.set(newEntry.id, currLogSource);
            }
            printer.print(currEntry);
        }
        printer.done(logSources, "Async sort complete.");
    });
};