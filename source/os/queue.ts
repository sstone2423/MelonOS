/* ------------
   Queue.ts
   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.
   ------------ */

module TSOS {
    export class Queue {
        q;

        constructor(q = new Array()) {
            this.q = q;
        }

        /**
         * Returns the queue's length
         */
        getSize(): number {
            return this.q.length;
        }

        /**
         * Returns true is queue is empty
         */
        isEmpty(): boolean {
            return (this.q.length === 0);
        }

        /**
         * Pushes element into the queue
         * @param element 
         */
        enqueue(element): void {
            this.q.push(element);
        }

        /**
         * Dequeue returns the first element of the array and shifts the array.
         * ex. [a, b, c, d].shift() = a
         */
        dequeue() {
            let retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }

            return retVal;
        }

        /**
         * Returns the queue as a concatenated string
         */
        toString() {
            let retVal = "";
            for (const i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }

            return retVal;
        }
    }
}
