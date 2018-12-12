///<reference path="../globals.ts" />
/* ------------
   scheduler.ts
   This is the client OS implementation of a scheduler. This does the appropriate context
   switching for processes using specified scheduling algorithms i.e Round robin, First Come
   First Serve, and priority.
   ------------ */
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            // Set default quantum of 6
            this.quantum = 6;
            // Set default algorithm to RR
            this.algorithm = "rr";
        }
        // ShellQuantum calls this function
        Scheduler.prototype.changeQuantum = function (userQuantum) {
            // Change quantum to user given int
            this.quantum = userQuantum;
        };
        // Change the algorithm
        Scheduler.prototype.changeAlgorithm = function (algorithm) {
            this.algorithm = algorithm;
        };
        // This gets called by the krnTimerISR
        Scheduler.prototype.contextSwitch = function () {
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
            }
            else {
                return;
            }
        };
        Scheduler.prototype.findHighestPriority = function () {
            var res;
            var size = _MemoryManager.readyQueue.getSize();
            for (var i = 0; i < size; i++) {
                var pcb = _MemoryManager.readyQueue.dequeue();
                if (res == null) {
                    res = pcb;
                }
                else {
                    if (pcb.Priority < res.Priority) {
                        // Put the process back into the ready queue
                        _MemoryManager.readyQueue.enqueue(res);
                        res = pcb;
                    }
                    else {
                        _MemoryManager.readyQueue.enqueue(pcb);
                    }
                }
            }
            return res;
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
