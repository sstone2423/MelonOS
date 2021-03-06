///<reference path="../globals.ts" />
/* ------------
     memory.ts
     Requires global.ts.
     Contains 3 partitions, 256 bytes long.
     Routines for the host memory simulation, NOT for the OS itself. In this manner, it's A LITTLE 
     BIT like a hypervisor, in that the Document environment inside a browser is the "bare metal" 
     (so to speak) for which we write code that hosts our client OS. But that analogy only goes 
     so far, and the lines are blurred, because we are using TypeScript/JavaScript in both the 
     host and client environments.
     ------------ */

module TSOS {
    export class Memory {
        memoryArray: Array<string>;
        partitions: Array<any>;

        /**
         * Each partition has a base, limit of 256, and boolean to check if empty
         */
        constructor() {
            this.partitions = [
                {"base": 0, "limit": PARTITION_SIZE, "isEmpty": true},
                {"base": 256, "limit": PARTITION_SIZE, "isEmpty": true},
                {"base": 512, "limit": PARTITION_SIZE, "isEmpty": true}
            ];
        }

        /**
         * Initialize the memory with 768 bytes of 00s
         */
        init(): void {
            this.memoryArray = new Array<string>(TOTAL_MEMORY_SIZE);
            // Initialize memory with 00's
            for (let i = 0; i < this.memoryArray.length; i++) {
                this.memoryArray[i] = "00";
            }
        }

        /**
         * Clear specified memory partition
         * @param partition 
         */
        clearPartition(partition: number): void {
            // Clear from the memoryArray[base] to memoryArray[limit]
            for (let i = this.partitions[partition].base; i < this.partitions[partition].base
                     + this.partitions[partition].limit; i++) {
                this.memoryArray[i] = "00";
                this.partitions[partition].isEmpty = true;
            }
        }

        /**
         * Check the isEmpty booleans to see if there is any open partitions
         */
        checkMemorySpace(): boolean {
            // Loop through each partition to find an empty partition.
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty) {
                    return true;
                }
            }

            return false;
        }

        /**
         * Find the first empty partition -- First one served
         */
        getEmptyPartition(): number {
            for (let i = 0; i < this.partitions.length; i++) {
                if (this.partitions[i].isEmpty) {
                    return i;
                }
            }
        }

        /**
         * Load the specified program into memory
         * @param opCodes 
         * @param partition 
         */
        loadIntoMemory(opCodes: Array<string>, partition: number): void {
            // Copy the textsplit program to the memoryArray
            for (let i = 0; i < opCodes.length; i++) {
                // Check partition
                if (partition == 0) {
                    // Copy into memoryArray
                    this.memoryArray[i] = opCodes[i];
                    // Set partition to not empty
                    this.partitions[0].isEmpty = false;
                // Check partition
                } else if (partition == 1) {
                    // Copy into memoryArray + partition size
                    this.memoryArray[i + 256] = opCodes[i];
                    // Set partition to not empty
                    this.partitions[1].isEmpty = false;
                // Check partition
                } else {
                    // Copy into memoryArray + partition size
                    this.memoryArray[i + 512] = opCodes[i];
                    // Set partition to not empty
                    this.partitions[2].isEmpty = false;
                }
            }
        }

        /**
         * Get the opCode out of memory and into CPU
         * @param programCounter 
         */
        readMemory(programCounter): string {
            // Ensure to add the current partitions base to the PC
            return this.memoryArray[this.partitions[_MemoryManager.runningProcess.partition].base
                 + programCounter].toString();
        }

        /**
         * Write to memory with a given address and value
         * @param address 
         * @param value 
         */
        writeMemory(address, value: string): void {
            // Check if this is in bounds
            if (_MemoryManager.inBounds(address)) {
            // Check to see if leading 0 needs to be added
            if (parseInt(value, 16) < 16) {
                    value = "0" + value;
                }
                // Save value to the memoryArray[partition].base + address
                this.memoryArray[this.partitions[_MemoryManager.runningProcess.partition].base
                     + address] = value;
            } else {
                _KernelInterruptQueue.enqueue(new Interrupt(BOUNDS_ERROR_IRQ, 0));
                _KernelInterruptQueue.enqueue(new Interrupt(PROCESS_EXIT_IRQ, false));
            }
        }

        /**
         * Loops address to a new PC
         * @param PC 
         * @param branch 
         * @param partition 
         */
        branchLoop(PC, branch, partition: number): number {
            return (PC + branch + 2) % this.partitions[partition].limit;
        }

        /**
         * Get data from a specified partition
         * @param partition 
         */
        getPartitionData(partition: number): Array<string> {
            const data = [];
            const base = this.partitions[partition].base;
            const limit = this.partitions[partition].limit + this.partitions[partition].base;
            for (let i = base; i < limit; i++){
                data.push(_Memory.memoryArray[i]);
            }

            return data;
        }

        /**
         * Empty each partition of memory
         */
        clearAllMemory(): void {
            // Check if CPU is executing
            if (!_CPU.isExecuting) {
                const readyQueueLength = _MemoryManager.readyQueue.getSize();
                // Check ready queue first since these will be executing shortly
                if (readyQueueLength > 0) {
                    for (let i = 0; i < readyQueueLength; i++) {
                        // Kill the process by removing it from the queue
                        const pcb = _MemoryManager.readyQueue.dequeue();
                        // Clear the memory partition
                        _Memory.clearPartition(pcb.partition);
                        _StdOut.putText("Clearing Process ID: " + pcb.pId
                            + " from partition: " + pcb.partition);
                        _StdOut.advanceLine();
                    }
                }
                // Check wait queue second
                const waitQueueLength = _MemoryManager.residentQueue.getSize();
                if (waitQueueLength > 0) {
                    for (let i = 0; i < waitQueueLength; i++) {
                        // Kill the process
                        const pcb = _MemoryManager.residentQueue.dequeue();
                        // Clear the memory partition
                        _Memory.clearPartition(pcb.partition);
                        _StdOut.putText("Clearing Process ID: " + pcb.pId
                            + " from partition: " + pcb.partition);
                        _StdOut.advanceLine();
                    }
                }
            }
        }
    }
}
