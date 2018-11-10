var TSOS;
(function (TSOS) {
    var Queue = /** @class */ (function () {
        function Queue(q) {
            if (q === void 0) { q = new Array(); }
            this.q = q;
        }
        Queue.prototype.getSize = function () {
            return this.q.length;
        };
        Queue.prototype.isEmpty = function () {
            return (this.q.length === 0);
        };
        Queue.prototype.enqueue = function (element) {
            this.q.push(element);
        };
        // Dequeue pops the first element of the array off.
        // ex. [a, b, c, d].shift() = a
        Queue.prototype.dequeue = function () {
            var retVal = null;
            if (this.q.length > 0) {
                retVal = this.q.shift();
            }
            return retVal;
        };
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
