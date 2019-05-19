/* ------------
   Queue.ts
   A simple Queue, which is really just a dressed-up JavaScript Array.
   See the Javascript Array documentation at
   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
   Look at the push and shift methods, as they are the least obvious here.
   ------------ */
var TSOS;
(function (TSOS) {
    var Queue = /** @class */ (function () {
        function Queue(q) {
            if (q === void 0) { q = new Array(); }
            this.q = q;
        }
        /**
         * Returns the queue's length
         */
        Queue.prototype.getSize = function () {
            return this.q.length;
        };
        /**
         * Returns true is queue is empty
         */
        Queue.prototype.isEmpty = function () {
            return (this.q.length === 0);
        };
        /**
         * Pushes element into the queue
         * @param element
         */
        Queue.prototype.enqueue = function (element) {
            this.q.push(element);
        };
        /**
         * Dequeue returns the first element of the array and shifts the array.
         * ex. [a, b, c, d].shift() = a
         */
        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };
        /**
         * Returns the queue as a concatenated string
         */
        Queue.prototype.toString = function () {
            var retVal = "";
            for (var i in this.q) {
                retVal += "[" + this.q[i] + "] ";
            }
            return retVal;
        };
        return Queue;
    }());
    TSOS.Queue = Queue;
})(TSOS || (TSOS = {}));
