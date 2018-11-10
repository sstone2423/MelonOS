///<reference path="../globals.ts" />

module TSOS {

    export class Scheduler {
        public quantum: number;
        public algorithm: string;

        constructor() {
            // Set default quantum of 6
            this.quantum = 6;
            // Set default algorithm to RR
            this.algorithm = "RR";
        }

        // ShellQuantum calls this function
        public changeQuantum(userQuantum): void {
            // Change quantum to user given int
            this.quantum = userQuantum;
        }

        // Change the algorithm
        public changeAlgorithm(algorithm): void {
            this.algorithm = algorithm;
        }

        // This gets called by the krnTimerISR
        public contextSwitch(): void {
            if (_MemoryManager.runningProcess != null) {
                // Set CPU to !isExecuting
                _CPU.isExecuting = false;
                // Save CPU info to PCB
                _MemoryManager.runningProcess.acc = _CPU.Acc;
                _MemoryManager.runningProcess.PC = _CPU.PC;
                _MemoryManager.runningProcess.IR = _Memory.memoryArray[_CPU.PC];
                _MemoryManager.runningProcess.xReg = _CPU.Xreg;
                _MemoryManager.runningProcess.yReg = _CPU.Yreg;
                _MemoryManager.runningProcess.zFlag = _CPU.Zflag;
                // Change state to ready
                _MemoryManager.runningProcess.state = "Ready";
                // Reset the CPU
                _CPU.init();
                // Put the runningProcess PCB back into the queue
                _MemoryManager.readyQueue.enqueue(_MemoryManager.runningProcess);
                // Clear the runningProcess
                _MemoryManager.runningProcess = null;
                // Put the next PCB into runningProcess
                _MemoryManager.executeProcess();
            } else {
                console.log("stop fucking with me");
            }
            
        }
    }
}