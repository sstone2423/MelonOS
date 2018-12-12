/* ------------
   swapper.ts
   This is the client OS implementation of a swapper.
   This is responsible for performing process swapping operations to and from disk.
   ------------ */

   module TSOS {
    export class Swapper {
        
        constructor() { }

        public putProcessToDisk(opCodes, pId): String {
            // Create file name for process... make it $SWAPpId
            let filename = "$SWAP" + pId;
            _DiskDriver.createFile(filename);
            let length = opCodes.length;
            while (length < PARTITION_SIZE) {
                opCodes.push("00");
                length++;
            }
            let status = _DiskDriver.writeSwap(filename, opCodes);
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

        public rollIn(pcb) {
            // Find swap file in directory structure
            let filename = "$SWAP" + pcb.pId;
            // Get the TSB of the program stored in disk
            let data = _DiskDriver.readFile(filename);
            if (data.status === SUCCESS) {
                // Trim off extra data since we now allocate 5 blocks (300 bytes) for a program, which is more than what a memory partition can hold
                let extraData = Math.ceil(PARTITION_SIZE / _Disk.dataSize) * _Disk.dataSize;
                for (let i = 0; i < extraData - PARTITION_SIZE; i++) {
                    data.data.pop();
                }
                // Look for a space in main memory to put the process from disk
                if (_Memory.checkMemorySpace()) {
                    let partition = _Memory.getEmptyPartition();
                    _Memory.loadIntoMemory(data.data, partition);
                    // Update the PCB's partition to the one it got placed in
                    pcb.partition = partition;
                    // Remove the program from disk
                    let status = _DiskDriver.deleteFile(filename);
                    if (status === SUCCESS) {
                        // Update disk display
                        Control.hostDisk();
                    } else {
                        _StdOut.putText("Uh oh.. File name did not delete correctly. Considering formatting the disk.");
                    }
                    // Update memory display 
                    Control.hostMemory();
                } else {
                    // If there is no room, then we must roll out a process from memory into the disk, then put the new process in that place in memory
                    this.rollOut(pcb);
                }
            } else {
                _StdOut.putText("Uh oh.. File name does not exist.");
            }
            
        }

        public rollOut(pcb) {
            // Find swap file in directory structure
            let filename = "$SWAP" + pcb.pId;
            // Get random partition from memory
            let swappedPartition = Math.floor(Math.random() * _Memory.partitions.length);
            // Look for the PCB with that partition
            let swappedPcb;
            // Look in ready queue
            for (let i = 0; i < _MemoryManager.readyQueue.q.length; i++) {
                if (_MemoryManager.readyQueue.q[i].partition == swappedPartition) {
                    swappedPcb = _MemoryManager.readyQueue.q[i];
                }
            }
            // Look in resident queue
            for (let i = 0; i < _MemoryManager.residentQueue.q.length; i++) {
                if (_MemoryManager.residentQueue.q[i].partition == swappedPartition) {
                    swappedPcb = _MemoryManager.residentQueue.q[i];
                }
            }

            if (swappedPcb != null) {
                // Get data from memory
                let memoryData = _Memory.getPartitionData(swappedPartition);
                // Free the partition
                _Memory.clearPartition(swappedPartition);
                // Get data from disk
                let data = _DiskDriver.readFile(filename);
                if (data.status === SUCCESS) {
                    // Trim off extra bytes
                    let extraData = Math.ceil(PARTITION_SIZE / _Disk.dataSize) * _Disk.dataSize;
                    for (let i = 0; i < extraData - PARTITION_SIZE; i++){
                        data.data.pop();
                    }
                    // Put data from disk into the partition from memory
                    if (_Memory.checkMemorySpace()) {
                        let partition = _Memory.getEmptyPartition();
                        _Memory.loadIntoMemory(data.data, partition);
                        // Update the PCB's partition to the one it got placed in
                        pcb.partition = partition;
                        pcb.swapped = false;
                        pcb.state = "Ready";
                        // Remove the program from disk by deleting the swap file
                        let status = _DiskDriver.deleteFile(filename);
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
                    let memoryToDiskTSB = this.putProcessToDisk(memoryData, swappedPcb.pId);
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
                    // No more memory in disk even though we just cleared room for it. Raise the alarms.
                    } else {
                        Control.hostLog("Not enough space for rollout", "os");
                        // Stop the CPU from executing, clear memory, and activate BSOD
                        _Memory.clearAllMemory();
                        _CPU.isExecuting = false;
                        _StdOut.putText("Not enough space on disk for rollout. Please reformat your disk.");
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