///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />
///<reference path="shell.ts" />
var TSOS;
(function (TSOS) {
    var MemoryManager = /** @class */ (function () {
        // Initialize variables
        function MemoryManager(processIncrementor, waitingQueue, readyQueue, runningProcess) {
            if (processIncrementor === void 0) { processIncrementor = 0; }
            if (waitingQueue === void 0) { waitingQueue = new TSOS.Queue; }
            if (readyQueue === void 0) { readyQueue = new TSOS.Queue; }
            this.processIncrementor = processIncrementor;
            this.waitingQueue = waitingQueue;
            this.readyQueue = readyQueue;
            this.runningProcess = runningProcess;
        }
        // Create a process for the loaded program (called from shellLoad command)
        MemoryManager.prototype.createProcess = function (opCodes) {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > _PartitionSize) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.");
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
                    // Add pcb to waitingQueue
                    this.waitingQueue.enqueue(pcb);
                    // Update the pcb info to the tableProcess
                    // Initialize table variable
                    var tableProcesses = document.getElementById("tableProcesses");
                    // Create a new row for the new process
                    var newRow = document.createElement("TR");
                    newRow.setAttribute("id", "processTR");
                    tableProcesses.appendChild(newRow);
                    // Create a column for PID
                    var colPID = document.createElement("TD");
                    colPID.setAttribute("id", "colPID");
                    newRow.appendChild(colPID);
                    colPID.innerHTML = pcb.pId.toString();
                    // Create a column for PC
                    var colPC = document.createElement("TD");
                    colPC.setAttribute("id", "colPC");
                    newRow.appendChild(colPC);
                    colPC.innerHTML = pcb.PC.toString();
                    // Create a column for ACC
                    var colACC = document.createElement("TD");
                    colACC.setAttribute("id", "colACC");
                    newRow.appendChild(colACC);
                    colACC.innerHTML = pcb.Acc.toString();
                    // Create a column for X
                    var colX = document.createElement("TD");
                    colX.setAttribute("id", "colX");
                    newRow.appendChild(colX);
                    colX.innerHTML = pcb.xReg.toString();
                    // Create a column for Y
                    var colY = document.createElement("TD");
                    colY.setAttribute("id", "colY");
                    newRow.appendChild(colY);
                    colY.innerHTML = pcb.yReg.toString();
                    // Create a column for Z flag
                    var colZ = document.createElement("TD");
                    colZ.setAttribute("id", "colZ");
                    newRow.appendChild(colZ);
                    colZ.innerHTML = pcb.zFlag.toString();
                    // Create a column for Priority
                    var colPriority = document.createElement("TD");
                    colPriority.setAttribute("id", "colPriority");
                    newRow.appendChild(colPriority);
                    colPriority.innerHTML = pcb.priority.toString();
                    // Create a column for State
                    var colState = document.createElement("TD");
                    colState.setAttribute("id", "colState");
                    newRow.appendChild(colState);
                    colState.innerHTML = pcb.state;
                }
            }
        };
        MemoryManager.prototype.executeProcess = function () {
            this.runningProcess = _MemoryManager.readyQueue.dequeue();
            _CPU.PC = this.runningProcess.PC;
            _CPU.Acc = this.runningProcess.Acc;
            _CPU.Xreg = this.runningProcess.xReg;
            _CPU.Yreg = this.runningProcess.yReg;
            _CPU.Zflag = this.runningProcess.Zflag;
            _CPU.isExecuting = true;
            this.runningProcess.state = "Executing";
            // TODO: Update Memory, CPU, PCB displays
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
            this.runningProcess = null;
        };
        return MemoryManager;
    }());
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
