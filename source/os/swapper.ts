///<reference path="../globals.ts" />
/* ------------
   swapper.ts
   This is the client OS implementation of a swapper.
   This is responsible for performing process swapping operations to and from disk.
   ------------ */

   module TSOS {
    export class Swapper {
        /**
         * 
         * @param opCodes 
         * @param pId 
         */
        putProcessToDisk(opCodes, pId): String {
            // Create file name for process
            let filename = SWAP + pId;
            _DiskDriver.createFile(filename);
            let length = opCodes.length;
            while (length < PARTITION_SIZE) {
                opCodes.push(OpCode.TERMINATOR);
                length++;
            }
            const status = _DiskDriver.writeSwap(filename, opCodes);
            if (status === SUCCESS) {
                return filename;
            } else if (status === DISK_IS_FULL) {
                filename = "full";

                return filename;
            } else {
                filename = "doesn't exist";

                return filename;
            }
        }

        /**
         * Roll in a process from disk into memory, then put 
         * the new process in that place in disk
         * @param pcb 
         */
        rollIn(pcb) {
            // Find swap file in directory structure
            const filename = SWAP + pcb.pId;
            // Get the TSB of the program stored in disk
            const data = _DiskDriver.readFile(filename);
            if (data.status === SUCCESS) {
                // Trim off extra data since we now allocate 5 blocks (300 bytes) for a program, 
                // which is more than what a memory partition can hold
                const extraData = Math.ceil(PARTITION_SIZE / _Disk.dataSize) * _Disk.dataSize;
                for (let i = 0; i < extraData - PARTITION_SIZE; i++) {
                    data.data.pop();
                }
                // Look for a space in main memory to put the process from disk
                if (_Memory.checkMemorySpace()) {
                    const partition = _Memory.getEmptyPartition();
                    _Memory.loadIntoMemory(data.data, partition);
                    // Update the PCB's partition to the one it got placed in
                    pcb.partition = partition;
                    // Remove the program from disk
                    const status = _DiskDriver.deleteFile(filename);
                    if (status === SUCCESS) {
                        // Update disk display
                        Control.hostDisk();
                    } else {
                        _StdOut.putText("Uh oh.. File name did not delete correctly. "
                            + "Considering formatting the disk.");
                    }
                    // Update memory display 
                    Control.hostMemory();
                } else {
                    // If there is no room, roll out the process
                    this.rollOut(pcb);
                }
            } else {
                _StdOut.putText("Uh oh.. File name does not exist.");
            }
        }

        // 
        /**
         * Roll out a process from memory into the disk, then put 
         * the new process in that place in memory
         * @param pcb 
         */
        rollOut(pcb) {
            // Find swap file in directory structure
            const filename = SWAP + pcb.pId;
            // Look for the PCB with that partition
            const swappedPcb = _Scheduler.findLowestPriority();
            const swappedPartition = swappedPcb.partition;

            if (swappedPcb != null) {
                // Get data from memory
                const memoryData = _Memory.getPartitionData(swappedPartition);
                // Free the partition
                _Memory.clearPartition(swappedPartition);
                // Get data from disk
                const data = _DiskDriver.readFile(filename);
                if (data.status === SUCCESS) {
                    // Trim off extra bytes
                    const extraData = Math.ceil(PARTITION_SIZE / _Disk.dataSize) * _Disk.dataSize;
                    for (let i = 0; i < extraData - PARTITION_SIZE; i++){
                        data.data.pop();
                    }
                    // Put data from disk into the partition from memory
                    if (_Memory.checkMemorySpace()) {
                        const partition = _Memory.getEmptyPartition();
                        _Memory.loadIntoMemory(data.data, partition);
                        // Update the PCB's partition to the one it got placed in
                        pcb.partition = partition;
                        pcb.swapped = false;
                        pcb.state = "Ready";
                        // Remove the program from disk by deleting the swap file
                        const status = _DiskDriver.deleteFile(filename);
                        if (status === SUCCESS) {
                            // Update disk display
                            Control.hostDisk();
                        } else {
                            _StdOut.putText("Deletion of file failed. ");

                            return;
                        }
                    } else {
                        _StdOut.putText("Memory ran out of space even though I cleared it..");

                        return;
                    }
                    // Put the data from memory into disk and get the TSB of where it was written
                    const memoryToDiskTSB = this.putProcessToDisk(memoryData, swappedPcb.pId);
                    if (memoryToDiskTSB != null) {
                        // Update the PCB to show that it is in disk
                        swappedPcb.partition = -1;
                        swappedPcb.swapped = true;
                        swappedPcb.state = "Swapped";
                        swappedPcb.TSB = memoryToDiskTSB;
                        Control.hostLog("Performed roll out and roll in", "os");
                        // Update processes display
                        Control.hostProcesses();

                        return;
                    // No more memory in disk even though we just cleared room for it. 
                    // Raise the alarms.
                    } else {
                        Control.hostLog("Not enough space for rollout", "os");
                        // Stop the CPU from executing, clear memory, and activate BSOD
                        _Memory.clearAllMemory();
                        _CPU.isExecuting = false;
                        _StdOut.putText("Not enough space on disk for rollout. Please "
                             + "reformat your disk.");
                        _Kernel.krnTrapError("AHHHHHH");
                    }
                } else {
                    _StdOut.putText("File read failure.");

                }
            } else {
                _StdOut.putText("Did not find a PCB to swap with..");
            }
        }
    }
}
