///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryArray) {
            if (memoryArray === void 0) { memoryArray = []; }
            this.memoryArray = memoryArray;
        }
        // Initializa the memory with 786 bytes
        Memory.prototype.init = function () {
            this.memoryArray = new Array(768);
            // Initialize memory with 00's
            for (var i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
