///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />

   module TSOS {

    export class MemoryManager {
        // Initialize variables
        public partitions: Array<any>;
        public partitionLimit: number = 256;
        public processIncrementor: number = 0;

        constructor(){
            this.partitions = [
                {"base": 0, "limit": this.partitionLimit, "isEmpty": true},
                {"base": 256, "limit": this.partitionLimit, "isEmpty": true},
                {"base": 512, "limit": this.partitionLimit, "isEmpty": true}
            ];
        }
        
        public loadIntoMemory(opCodes, partition): void {
            // Copy the textsplit program to the memoryArray
            for (let i = 0; i < opCodes.length; i++) {
                _Memory.memoryArray[i] = opCodes[i];
            }
            // Set boolean to let the OS know that this partition is being used
            this.partitions[partition].isEmpty = false;
        }
        
        public createProcess(opCodes): void {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > this.partitionLimit) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.")
            }

            // Check if there is a partition available
            if (this.checkMemorySpace(opCodes.length)) {
                // Create a new PCB
                let pcb = new TSOS.ProcessControlBlock(this.processIncrementor);
                
            }
        }

        // Check the isEmpty booleans to see if there is any open partitions
        public checkMemorySpace(opCodeLength): boolean {
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty) {
                    return true;
                }
            }
            return false;
        }
    }
}
