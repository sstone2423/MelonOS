///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />
///<reference path="shell.ts" />

/* ------------
   memoryManager.ts
   This is the client OS implementation of the Memory Manager
   ------------ */

   module TSOS {

    export class MemoryManager {
        // Initialize variables
        public processIncrementor: number;
        public residentQueue: any;
        public readyQueue: any;
        public runningProcess: any;

        constructor() {
            this.processIncrementor = 0;
            this.readyQueue = new TSOS.Queue;
            this.residentQueue = new TSOS.Queue;
            this.runningProcess = null;
        }
        
        // Create a process for the loaded program (called from shellLoad command)
        public createProcess(opCodes, args): void {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > PARTITION_SIZE) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.");
                _StdOut.advanceLine();
            // Check if there is a partition available
            } else if (_Memory.checkMemorySpace()) {
                // Create a new PCB with the current processIncrementor
                let pcb = new ProcessControlBlock(this.processIncrementor);
                // Increment the processIncrementor
                this.processIncrementor++;
                // Get an empty partition
                let partition = _Memory.getEmptyPartition();
                // Initialize the values of the PCB
                pcb.init(partition);
                // Assign priority if given
                if (args.length > 0) {
                    pcb.priority = parseInt(args[0]);
                } else {
                    pcb.priority = 1;
                }
                // Load into memory
                _Memory.loadIntoMemory(opCodes, pcb.partition);
                // Add pcb to residentQueue
                this.residentQueue.enqueue(pcb);
                // Update the memory,processes, and host log displays
                _StdOut.putText("Process " + pcb.pId + " loaded successfully.");
                Control.hostMemory();
                Control.hostProcesses();
            // If there is no more memory, then go find free space in the disk
            // Call the swapper to perform swapping operations
            } else {
                // We also have to make sure the program is not too large. A program is limited by the partition size.
                let tsb = _Swapper.putProcessToDisk(opCodes, this.processIncrementor);
                // See if there is space on the disk for the process
                if (tsb != "full" || tsb != "doesn't exist") {
                    // There is space on the disk for the process, so create a new PCB
                    let pcb = new ProcessControlBlock(this.processIncrementor);
                    // Increment the processIncrementor
                    this.processIncrementor++;
                    pcb.init(-1);
                    // Assign priority if given
                    if (args.length > 0) {
                        pcb.priority = args[0];
                    } else {
                        pcb.priority = 1;
                    }
                    // Set the PCB's process as swapped out to disk
                    pcb.swapped = true;
                    // pcb.TSB = tsb;
                    pcb.state = "Swapped";
                    // Put the new PCB onto the resident queue where it waits for CPU time
                    this.residentQueue.enqueue(pcb);
                    _StdOut.putText("Process " + pcb.pId + " loaded successfully.");
                } else if (tsb === "full") {
                    _StdOut.putText("Loading of program failed. Disk is full.");
                } else {
                    _StdOut.putText("Loading of program failed. Filename exists.");
                }
            }
        }
    
        public executeProcess(): void {
            // Call the scheduler to reorder the ready queue if the scheduling scheme is Priority
            if (_Scheduler.algorithm == "priority") {
                this.runningProcess = _Scheduler.findHighestPriority();
            } else {
                this.runningProcess = _MemoryManager.readyQueue.dequeue();
                _CPU.PC = this.runningProcess.PC;
                _CPU.Acc = this.runningProcess.acc;
                _CPU.Xreg = this.runningProcess.xReg;
                _CPU.Yreg = this.runningProcess.yReg;
                _CPU.Zflag = this.runningProcess.zFlag;
                // We need to check if the process is stored in disk. If so, we need to have the swapper roll in from disk, and 
                // roll out a process in memory if there is not enough space in memory for the rolled-in process.
                if (this.runningProcess.swapped) {
                    // Roll it in from disk
                    _Swapper.rollIn(this.runningProcess);
                    // No longer swapped out to disk
                    this.runningProcess.swapped = false;
                    this.runningProcess.TSB = "0:0:0";
                }
                _CPU.isExecuting = true;
                this.runningProcess.state = "Executing";
                
            }
        }

        public checkReadyQueue(): void {
            if (!this.readyQueue.isEmpty()) {
                this.executeProcess();
            }
        }
        
        // Exit a process from the CPU, reset CPU values, reset memory partition
        public exitProcess(): void {
            // Init the CPU to reset registers and isExecuting
            _CPU.init();
            // Reset the partition to empty
            _Memory.partitions[this.runningProcess.partition].isEmpty = true;
            // Reset the memoryArray within the partition to 00's
            // set counter = base, counter < runningPartition.limit
            for (let i = _Memory.partitions[this.runningProcess.partition].base; i < _Memory.partitions[this.runningProcess.partition].limit; i++) {
                _Memory.memoryArray[i] = "00";
            }
            // Notify the user the process has been exited
            _StdOut.advanceLine();
            _StdOut.putText("Exiting process " + this.runningProcess.pId);
            _StdOut.advanceLine();
            // Check if swap file exists for process, delete it if there is
            let filename = "$SWAP" + this.runningProcess.pId;
            // Remove the program from disk by deleting the swap file
            _DiskDriver.deleteFile(filename);
            // Print out the wait time and turnaround time for that process
            _StdOut.putText("Turnaround time: " + this.runningProcess.turnAroundTime + " cycles.");
            _StdOut.advanceLine();
            _StdOut.putText("Wait time: " + this.runningProcess.waitTime + " cycles.");
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            // Reset the runningProcess to null
            this.runningProcess = null;
        }

        // Kill a specific process specified by processID
        // TODO: make this more efficient?
        public killProcess(processID): void {
            let found = false;
            // Check if a process is running
            if (this.runningProcess !== null) {
                // Check if the process is executing
                if (this.runningProcess.pId == processID) {
                    this.exitProcess();
                    found = true;
                } 
            }
            // Check if its in the ready queue
            let readyQueueLength = this.readyQueue.getSize();
            console.log(readyQueueLength + found);
            if (readyQueueLength > 0 && !found) {
                console.log("ready");
                for (let i = 0; i < readyQueueLength; i++) {
                    let pcb = this.readyQueue.dequeue();
                    // If it matches, clear the partition and check for swap. 
                    if (pcb.pId == processID) {
                        this.clearPartitionCheckSwap(pcb);
                        found = true;
                    // If it doesnt match, put it back in the queue
                    } else {
                        this.readyQueue.enqueue(pcb);
                    }
                }
            }
            // Check if its in the resident queue
            let residentQueueLength = this.residentQueue.getSize();
            if (residentQueueLength > 0 && !found) {
                for (let i = 0; i < residentQueueLength; i++) {
                    let pcb = this.residentQueue.dequeue();
                    // If it matches, clear the partition and check for swap.
                    if (pcb.pId == processID) {
                        this.clearPartitionCheckSwap(pcb);
                        found = true;
                    // If it doesnt match, put it back in the queue
                    } else {
                        this.residentQueue.enqueue(pcb);
                    }
                }
            }
            // If not found, let the user know
            if (!found) {
                _StdOut.putText("Process " + processID + " does not exist..");
            }
        }

        // Checks to make sure the memory being accessed is within the range specified by the base/limit
        public inBounds(address): boolean {
            let partition = this.runningProcess.partition;
            if(address + _Memory.partitions[partition].base < _Memory.partitions[partition].base
                + _Memory.partitions[partition].limit && address + _Memory.partitions[partition].base
                >= _Memory.partitions[partition].base) {
                return true;
            }
            else {
                return false;
            }
        }

        public clearPartitionCheckSwap(pcb) {
            _Memory.clearPartition(pcb.partition);
            _StdOut.putText("Exiting process " + pcb.pId);
            if (pcb.swapped) {
                // Find swap file in directory structure
                let filename = "$SWAP" + pcb.pId;
                // Remove the program from disk by deleting the swap file
                _DiskDriver.deleteFile(filename);
            }
        }

        // Update turnaround times and wait times for all processes
        public processStats(): void {
            // Increment the turnaround times for all processes
            // Increment the wait times for all processes in the ready queue
            this.runningProcess.turnAroundTime++;
            for (let i = 0; i < this.readyQueue.getSize(); i++) {
                let pcb = this.readyQueue.dequeue();
                pcb.turnAroundTime++;
                pcb.waitTime++;
                this.readyQueue.enqueue(pcb);
            }
        }
    }
}
