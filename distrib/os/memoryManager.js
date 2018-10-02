///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            this.partitionLimit = 256;
            this.processIncrementor = 0;
            this.partitions = [
                { "base": 0, "limit": this.partitionLimit, "isEmpty": true },
                { "base": 256, "limit": this.partitionLimit, "isEmpty": true },
                { "base": 512, "limit": this.partitionLimit, "isEmpty": true }
            ];
        }
        MemoryManager.prototype.loadIntoMemory = function (opCodes, partition) {
            // Copy the textsplit program to the memoryArray
            for (var i = 0; i < opCodes.length; i++) {
                _Memory.memoryArray[i] = opCodes[i];
            }
            // Set boolean to let the OS know that this partition is being used
            this.partitions[partition].isEmpty = false;
        };
        MemoryManager.prototype.createProcess = function (opCodes) {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > this.partitionLimit) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.");
            }
            // Check if there is a partition available
            if (this.checkMemorySpace(opCodes.length)) {
                // Create a new PCB
                var pcb = new TSOS.ProcessControlBlock(this.processIncrementor);
            }
        };
        // Check the isEmpty booleans to see if there is any open partitions
        MemoryManager.prototype.checkMemorySpace = function (opCodeLength) {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty) {
                    return true;
                }
            }
            return false;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
