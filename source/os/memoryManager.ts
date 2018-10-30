///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />
///<reference path="shell.ts" />

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
        }
        
        // Create a process for the loaded program (called from shellLoad command)
        public createProcess(opCodes): void {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > _PartitionSize) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.");
                _StdOut.advanceLine();
                _StdOut.putPrompt();
            } else {
                // Check if there is a partition available
                if (_Memory.checkMemorySpace()) {
                    // Create a new PCB with the current processIncrementor
                    let pcb = new ProcessControlBlock(this.processIncrementor);
                    // Increment the processIncrementor
                    this.processIncrementor++;
                    // Get an empty partition
                    let partition = _Memory.getEmptyPartition();
                    // Initialize the values of the PCB
                    pcb.init(partition);
                    // Load into memory
                    _Memory.loadIntoMemory(opCodes, pcb.partition);
                    // Add pcb to residentQueue
                    this.residentQueue.enqueue(pcb);
                    // Update the memory and processes displays
                    Control.hostMemory();
                    Control.hostProcesses();
                } else {
                    _StdOut.putText("There are no free memory partitions.");
                    _StdOut.advanceLine();
                    _StdOut.putPrompt();
                }
            }
        }
    
        public executeProcess(): void {
            this.runningProcess = _MemoryManager.readyQueue.dequeue();
            _CPU.PC = this.runningProcess.PC;
            _CPU.Acc = this.runningProcess.acc;
            _CPU.Xreg = this.runningProcess.xReg;
            _CPU.Yreg = this.runningProcess.yReg;
            _CPU.Zflag = this.runningProcess.zFlag;
            _CPU.isExecuting = true;
            this.runningProcess.state = "Executing";
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
            // For iProject 2, init the memory to reset the values. Will change later
            _Memory.init();
            // TODO: Update displays
            _StdOut.putText("Exiting process " + this.runningProcess.pId);
            this.runningProcess = null;
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

    }
}
