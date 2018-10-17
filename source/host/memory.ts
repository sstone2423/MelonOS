///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory {
            public memoryArray: Array<string>;
            public partitions: Array<any>;
                    
            constructor() {
                this.partitions = [
                    {"base": 0, "limit": _PartitionSize, "isEmpty": true},
                    {"base": 256, "limit": _PartitionSize, "isEmpty": true},
                    {"base": 512, "limit": _PartitionSize, "isEmpty": true}
                ];
            }

            // Initialize the memory with 768 bytes
            public init(): void {
                this.memoryArray = new Array<string>(_TotalMemorySize);
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
                let found = false;
                let i = 0;
                while (found || i > 2) {
                    if (this.partitions[i].isEmpty) {
                        found = true;
                        return i;
                    } else {
                        i++;
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
                //this.partitions[partition].isEmpty = false;
            }

            // Get the opCode out of memory and into CPU
            // TODO: Check partitions?
            public readMemory(programCounter): string {
                return _Memory.memoryArray[programCounter];
            }

            public writeMemory(address, value): void {
                // Check to see if leading 0 needs to be added
                if (parseInt(value, 16) < 16) {
                    value = "0" + value;
                }
                // Save value to the memoryArray
                _Memory.memoryArray[address] = value;
            }
        }
    }