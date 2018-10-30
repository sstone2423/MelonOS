///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.partitions = [
                { "base": 0, "limit": _PartitionSize, "isEmpty": true },
                { "base": 256, "limit": _PartitionSize + 256, "isEmpty": true },
                { "base": 512, "limit": _PartitionSize + 256, "isEmpty": true }
            ];
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
                }
            }
            return false;
        };
        // Find the first empty partition -- First one served
        Memory.prototype.getEmptyPartition = function () {
            for (var i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty) {
                    return i;
                }
            }
        };
        // Load the program into memory
        Memory.prototype.loadIntoMemory = function (opCodes, partition) {
            // Copy the textsplit program to the memoryArray
            for (var i = 0; i < opCodes.length; i++) {
                // Check partition
                if (partition == 0) {
                    // Copy into memoryArray
                    _Memory.memoryArray[i] = opCodes[i];
                    // Set partition to not empty
                    this.partitions[0].isEmpty = false;
                    // Check partition
                }
                else if (partition == 1) {
                    // Copy into memoryArray + partition size
                    _Memory.memoryArray[i + 256] = opCodes[i];
                    // Set partition to not empty
                    this.partitions[1].isEmpty = false;
                    // Check partition
                }
                else {
                    // Copy into memoryArray + partition size
                    _Memory.memoryArray[i + 512] = opCodes[i];
                    // Set partition to not empty
                    this.partitions[2].isEmpty = false;
                }
            }
        };
        // Get the opCode out of memory and into CPU
        // TODO: Check partitions?
        Memory.prototype.readMemory = function (programCounter) {
            return _Memory.memoryArray[programCounter];
        };
        Memory.prototype.writeMemory = function (address, value) {
            // Check to see if leading 0 needs to be added
            if (parseInt(value, 16) < 16) {
                value = "0" + value;
            }
            // Save value to the memoryArray
            _Memory.memoryArray[address] = value;
        };
        // Loops address
        Memory.prototype.branchLoop = function (PC, branch) {
            return (PC + branch + 2);
        };
        return Memory;
    }());
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
