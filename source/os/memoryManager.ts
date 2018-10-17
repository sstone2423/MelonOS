///<reference path="../globals.ts" />
///<reference path="processControlBlock.ts" />
///<reference path="queue.ts" />
///<reference path="shell.ts" />

   module TSOS {

    export class MemoryManager {
        // Initialize variables
        constructor(public processIncrementor: number = 0,
                    public waitingQueue = new TSOS.Queue,
                    public readyQueue = new TSOS.Queue){
        }
        
        // Create a process for the loaded program (called from shellLoad command)
        public createProcess(opCodes): void {
            // Check to see if the program is greater than the partition size
            if (opCodes.length > _PartitionSize) {
                _StdOut.putText("Program load failed. Program is over 256 bytes in length.")
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
                    // Add pcb to waitingQueue
                    this.waitingQueue.enqueue(pcb);
                    // Update the pcb info to the tableProcess
                    // Initialize table variable
                    let tableProcesses = document.getElementById("tableProcesses");
                    // Create a new row for the new process
                    let newRow = document.createElement("TR");
                    newRow.setAttribute("id", "processTR");
                    tableProcesses.appendChild(newRow);
                    // Create a column for PID
                    let colPID = document.createElement("TD");
                    colPID.setAttribute("id", "colPID");
                    newRow.appendChild(colPID);
                    colPID.innerHTML = pcb.pId.toString();
                    // Create a column for PC
                    let colPC = document.createElement("TD");
                    colPC.setAttribute("id", "colPC");
                    newRow.appendChild(colPC);
                    colPC.innerHTML = pcb.PC.toString();
                    // Create a column for ACC
                    let colACC = document.createElement("TD");
                    colACC.setAttribute("id", "colACC");
                    newRow.appendChild(colACC);
                    colACC.innerHTML = pcb.Acc.toString();
                    // Create a column for X
                    let colX = document.createElement("TD");
                    colX.setAttribute("id", "colX");
                    newRow.appendChild(colX);
                    colX.innerHTML = pcb.xReg.toString();
                    // Create a column for Y
                    let colY = document.createElement("TD");
                    colY.setAttribute("id", "colY");
                    newRow.appendChild(colY);
                    colY.innerHTML = pcb.yReg.toString();
                    // Create a column for Z flag
                    let colZ = document.createElement("TD");
                    colZ.setAttribute("id", "colZ");
                    newRow.appendChild(colZ);
                    colZ.innerHTML = pcb.zFlag.toString();
                    // Create a column for Priority
                    let colPriority = document.createElement("TD");
                    colPriority.setAttribute("id", "colPriority");
                    newRow.appendChild(colPriority);
                    colPriority.innerHTML = pcb.priority.toString();
                    // Create a column for State
                    let colState = document.createElement("TD");
                    colState.setAttribute("id", "colState");
                    newRow.appendChild(colState);
                    colState.innerHTML = pcb.state;
                }
            }
        }
    
        public executeProcess(): void {
            let process = _MemoryManager.readyQueue.dequeue();
            _CPU.PC = process.PC;
            _CPU.Acc = process.Acc;
            _CPU.Xreg = process.xReg;
            _CPU.Yreg = process.yReg;
            _CPU.Zflag = process.Zflag;
            _CPU.isExecuting = true;
            process.state = "Executing";

            // TODO: Update Memory, CPU, PCB displays
        }

        public checkReadyQueue(): void {
            if (!this.readyQueue.isEmpty()) {
                this.executeProcess();
            }
        }
    }
}
