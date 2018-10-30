///<reference path="../globals.ts" />
/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */
var TSOS;
(function (TSOS) {
    var Memory = /** @class */ (function () {
        function Memory() {
            this.partitions = [
                { "base": 0, "limit": _PartitionSize, "isEmpty": true },
                { "base": 256, "limit": _PartitionSize, "isEmpty": true },
                { "base": 512, "limit": _PartitionSize, "isEmpty": true }
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
                    break;
                }
            }
            return false;
        };
        // Find the first empty partition -- First one served
        Memory.prototype.getEmptyPartition = function () {
            var found = false;
            var i = 0;
            while (found || i > 2) {
                if (this.partitions[i].isEmpty) {
                    found = true;
                    return i;
                }
                else {
                    i++;
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
            //this.partitions[partition].isEmpty = false;
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
