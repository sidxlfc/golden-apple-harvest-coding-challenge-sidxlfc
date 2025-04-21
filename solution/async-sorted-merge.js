"use strict";
import MinHeap from "./min-heap.js";

// Print all entries, across all of the *async* sources, in chronological order.

export const asyncSortedMerge = async(logSources, printer, bufferSize = logSources.length * 2 + 2) => {

    const heap = new MinHeap();
    const promises = new Array();
    const multiple = bufferSize / logSources.length;
    let bufferUsed = 0;

    // Initialize the heap with the first entry from each log source
    for (let i = 0; i < logSources.length; i++) {
        const entry = await logSources[i].popAsync();
        let promisesForThisLogsource = new Array();
        if (entry) {
            for (let j = 0; j < multiple - 1 && bufferUsed < bufferSize; j++) {
                promisesForThisLogsource.push(logSources[i].popAsync());
                bufferUsed++;
            }
            console.log(`Pushing ${entry.msg} from source ${i}`);
            heap.insert({ date: entry.date, msg: entry.msg, sourceIndex: i });
        }
        promises.push(promisesForThisLogsource);
    }

    while (!heap.isEmpty()) {
        let { date, msg, sourceIndex } = heap.remove();
        console.log(`Printing ${msg} from source ${sourceIndex}`);
        const promisesForThisLogsource = promises[sourceIndex];
        printer.print({ date, msg });

        let nextEntry = null;
        if (promisesForThisLogsource.length > 0) {
            nextEntry = await promisesForThisLogsource.shift();
            bufferUsed--;
        } else {
            nextEntry = await logSources[sourceIndex].popAsync();
        }
        if (nextEntry) {
            if (bufferUsed < bufferSize && !logSources[sourceIndex].drained) {
                promisesForThisLogsource.push(logSources[sourceIndex].popAsync());
                bufferUsed++;
            }
            promises[sourceIndex] = promisesForThisLogsource;
            heap.insert({ date: nextEntry.date, msg: nextEntry.msg, sourceIndex });
        }
    }

    printer.done(logSources, "Async sort complete.");
};