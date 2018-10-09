///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory(memoryArray, partitions) {
            if (memoryArray === void 0) { memoryArray = []; }
            if (partitions === void 0) { partitions = [
                { "base": 0, "limit": _PartitionSize, "isEmpty": true },
                { "base": 256, "limit": _PartitionSize, "isEmpty": true },
                { "base": 512, "limit": _PartitionSize, "isEmpty": true }
            ]; }
            this.memoryArray = memoryArray;
            this.partitions = partitions;
        }
        // Initialize the memory with 768 bytes
        Memory.prototype.init = function () {
            this.memoryArray = new Array(_TotalMemorySize);
            // Initialize memory with 00's
            for (var i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        };
        // Check the isEmpty booleans to see if there is any open partitions
        Memory.prototype.checkMemorySpace = function () {
            // Loop through each partition to find an empty partition.
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty) {
                    return true;
                    break;
                }
            }
            return false;
        };
        // Find the first empty partition -- First one served
        Memory.prototype.getEmptyPartition = function () {
            for (var i = 0; i < this.partitions.length; i++) {
                // When found, return the index and break from the loop
                if (this.partitions[i].isEmpty) {
                    return i;
                    break;
                }
            }
        };
        // Load the program into memory
        Memory.prototype.loadIntoMemory = function (opCodes, partition) {
            // Copy the textsplit program to the memoryArray
            for (var i = 0; i < opCodes.length; i++) {
                _Memory.memoryArray[i] = opCodes[i];
            }
            // Set boolean to let the OS know that this partition is being used
            this.partitions[partition].isEmpty = false;
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
