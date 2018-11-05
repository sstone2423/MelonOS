///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />
///<reference path="shell.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        function MemoryManager() {
            this.processIncrementor = 0;
            this.readyQueue = new TSOS.Queue;
            this.residentQueue = new TSOS.Queue;
        }
        // Create a process for the loaded program (called from shellLoad command)
        MemoryManager.prototype.createProcess = function (opCodes) {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > _PartitionSize) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.");
                _StdOut.advanceLine();
            }
            else {
                // Check if there is a partition available
                if (_Memory.checkMemorySpace()) {
                    // Create a new PCB with the current processIncrementor
                    var pcb = new TSOS.ProcessControlBlock(this.processIncrementor);
                    // Increment the processIncrementor
                    this.processIncrementor++;
                    // Get an empty partition
                    var partition = _Memory.getEmptyPartition();
                    // Initialize the values of the PCB
                    pcb.init(partition);
                    // Load into memory
                    _Memory.loadIntoMemory(opCodes, pcb.partition);
                    // Add pcb to residentQueue
                    this.residentQueue.enqueue(pcb);
                    // Update the memory,processes, and host log displays
                    _StdOut.putText("Process " + pcb.pId + " loaded successfully.");
                    TSOS.Control.hostMemory();
                    TSOS.Control.hostProcesses();
                }
                else {
                    _StdOut.putText("There are no free memory partitions.");
                    _StdOut.advanceLine();
                }
            }
        };
        MemoryManager.prototype.executeProcess = function () {
            this.runningProcess = _MemoryManager.readyQueue.dequeue();
            _CPU.PC = this.runningProcess.PC;
            _CPU.Acc = this.runningProcess.acc;
            _CPU.Xreg = this.runningProcess.xReg;
            _CPU.Yreg = this.runningProcess.yReg;
            _CPU.Zflag = this.runningProcess.zFlag;
            _CPU.isExecuting = true;
            this.runningProcess.state = "Executing";
        };
        MemoryManager.prototype.checkReadyQueue = function () {
            if (!this.readyQueue.isEmpty()) {
                this.executeProcess();
            }
        };
        // Exit a process from the CPU, reset CPU values, reset memory partition
        MemoryManager.prototype.exitProcess = function () {
            // Init the CPU to reset registers and isExecuting
            _CPU.init();
            // For iProject 2, init the memory to reset the values. Will change later
            _Memory.init();
            // TODO: Update displays
            _StdOut.putText("Exiting process " + this.runningProcess.pId);
            _StdOut.advanceLine();
            this.runningProcess = null;
        };
        // Checks to make sure the memory being accessed is within the range specified by the base/limit
        MemoryManager.prototype.inBounds = function (address) {
            var partition = this.runningProcess.partition;
            if (address + _Memory.partitions[partition].base < _Memory.partitions[partition].base
                + _Memory.partitions[partition].limit && address + _Memory.partitions[partition].base
                >= _Memory.partitions[partition].base) {
                return true;
            }
            else {
                return false;
            }
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
