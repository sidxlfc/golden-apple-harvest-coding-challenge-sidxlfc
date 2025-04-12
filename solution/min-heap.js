export default class MinHeap {
    constructor() {
        this.heap = [];
    }

    // Helper method to get the parent index
    getParentIndex(index) {
        return Math.floor((index - 1) / 2);
    }

    // Helper method to get the left child index
    getLeftChildIndex(index) {
        return 2 * index + 1;
    }

    // Helper method to get the right child index
    getRightChildIndex(index) {
        return 2 * index + 2;
    }

    // Swap two elements in the heap
    swap(index1, index2) {
        [this.heap[index1], this.heap[index2]] = [this.heap[index2], this.heap[index1]];
    }

    // Insert a new entry into the heap
    insert(entry) {
        if (!(entry.date instanceof Date)) {
            throw new Error("Entry must have a 'date' property of type Date.");
        }
        this.heap.push(entry);
        this.heapifyUp();
    }

    // Remove and return the smallest entry (root) from the heap
    remove() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return root;
    }

    // Heapify up to maintain the heap property
    heapifyUp() {
        let index = this.heap.length - 1;
        while (
            index > 0 &&
            this.heap[index].date < this.heap[this.getParentIndex(index)].date
        ) {
            this.swap(index, this.getParentIndex(index));
            index = this.getParentIndex(index);
        }
    }

    // Heapify down to maintain the heap property
    heapifyDown() {
        let index = 0;
        while (this.getLeftChildIndex(index) < this.heap.length) {
            let smallerChildIndex = this.getLeftChildIndex(index);
            if (
                this.getRightChildIndex(index) < this.heap.length &&
                this.heap[this.getRightChildIndex(index)].date <
                this.heap[smallerChildIndex].date
            ) {
                smallerChildIndex = this.getRightChildIndex(index);
            }

            if (this.heap[index].date <= this.heap[smallerChildIndex].date) {
                break;
            }

            this.swap(index, smallerChildIndex);
            index = smallerChildIndex;
        }
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length == 0;
    }

    // Peek at the smallest entry without removing it
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }
}