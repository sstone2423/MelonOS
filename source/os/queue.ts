/* ------------
   Queue.ts
   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.
   ------------ */

module TSOS {
    export class Queue {

        constructor(public q = new Array()) { }

        public getSize(): number {
            return this.q.length;
        }

        public isEmpty(): boolean {
            return (this.q.length === 0);
        }

        public enqueue(element): void {
            this.q.push(element);
        }

        // Dequeue returns the first element of the array and shifts the array.
        // ex. [a, b, c, d].shift() = a
        public dequeue() {
            let retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        }

        public toString() {
            let retVal = "";
            for (const i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        }
    }
}
