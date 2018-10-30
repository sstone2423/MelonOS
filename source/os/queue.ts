module TSOS {
    export class Queue {
        constructor(public q = new Array()) {
        }

        public getSize() {
            return this.q.length;
        }

        public isEmpty() {
            return (this.q.length === 0);
        }

        public enqueue(element) {
            this.q.push(element);
        }

        // Dequeue pops the first element of the array off.
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
