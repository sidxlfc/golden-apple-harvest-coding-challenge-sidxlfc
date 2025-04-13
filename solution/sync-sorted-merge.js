"use strict";
import MinHeap from "./min-heap.js";

/**
 * This solution uses a min-heap to point to the next entry we want to print,
 * and a map to keep track of which entry in the heap corresponds to which logSource,
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
    // map to help us lookup which `logSource` an entry in the heap belongs to.
    // This also stores `logSources.length` number of keys at the most
    const entryToLogSourceMap = new Map();

    // function to generate a string ID to enable storing entries into a map based on their ID as a key
    function generateEntryId(entry) {
        // adding "random" salt to account for cases where 2 entries have the same `msg` and `date` (collision)
        const random = Math.floor(Math.random() * 100);
        return `${entry.msg}${entry.date}${random}`;
    }

    // add all first entries from logSources to the heap and their corresponding `logSource` to the map
    for (const logSource of logSources) {
        if (!logSource) continue;
        const entry = logSource.pop();
        if (entry) {
            entry.id = generateEntryId(entry);
            heap.insert(entry);
            entryToLogSourceMap.set(entry.id, logSource);
        }
    }

    // look for the next entry from the heap, while ensuring to keep the heap and the map up-to-date
    while (!heap.isEmpty()) {
        const currEntry = heap.remove();
        const currLogSource = entryToLogSourceMap.get(currEntry.id);
        entryToLogSourceMap.delete(currEntry.id);

        const newEntry = currLogSource.pop();
        if (newEntry) {
            newEntry.id = generateEntryId(newEntry);
            heap.insert(newEntry);
            entryToLogSourceMap.set(newEntry.id, currLogSource);
        }
        printer.print(currEntry);
    }
    printer.done(logSources, "Sync sort complete.");
};