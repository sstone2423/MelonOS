///<reference path="../globals.ts" />
///<reference path="queue.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            // Initialize variables
            this.residentQueue = new TSOS.Queue;
            this.readyQueue = new TSOS.Queue;
            this.processIncrementor = 0;
            this.base = 0;
            this.limit = 0;
        }
        MemoryManager.prototype.uploadProgram = function (programArray) {
            // Copy the textsplit program to the memoryArray
            for (var i = 0; i < programArray.length; i++) {
                _Memory.memoryArray[i] = programArray[i];
            }
            // Create a new PCB for the process
            var currentPCB = new TSOS.ProcessControlBlock();
            // Change the PID
            currentPCB.processId = this.processIncrementor;
            // Increment the PID
            this.processIncrementor++;
            // Set the limit
            this.limit = _Memory.memoryArray.length;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
