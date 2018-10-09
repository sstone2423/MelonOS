///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory {
            constructor(public memoryArray: Array<String> = [],
                        public partitions = [
                            {"base": 0, "limit": _PartitionSize, "isEmpty": true},
                            {"base": 256, "limit": _PartitionSize, "isEmpty": true},
                            {"base": 512, "limit": _PartitionSize, "isEmpty": true}
                        ]) {
            }

            // Initialize the memory with 768 bytes
            public init(): void {
                this.memoryArray = new Array<String>(_TotalMemorySize);
                // Initialize memory with 00's
                for (let i = 0; i < this.memoryArray.length; i++) {
                    this.memoryArray[i] = "00";
                }
            }

            // Check the isEmpty booleans to see if there is any open partitions
            public checkMemorySpace(): boolean {
                // Loop through each partition to find an empty partition.
                for (let i = 0; i < this.partitions.length; i++) {
                    if (this.partitions[i].isEmpty) {
                        return true;
                        break;
                    }
                }
                return false;
            }

            // Find the first empty partition -- First one served
            public getEmptyPartition(): number {
                for (let i = 0; i < this.partitions.length; i++) {
                    // When found, return the index and break from the loop
                    if (this.partitions[i].isEmpty) {
                        return i;
                        break;
                    }
                }
            }

            // Load the program into memory
            public loadIntoMemory(opCodes, partition): void {
                // Copy the textsplit program to the memoryArray
                for (let i = 0; i < opCodes.length; i++) {
                    _Memory.memoryArray[i] = opCodes[i];
                }
                // Set boolean to let the OS know that this partition is being used
                this.partitions[partition].isEmpty = false;
            }
        }
    }