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
            this.algorithm = RR;
        }
        /**
         * Changes the scheduling quantum
         * ShellQuantum calls this function
         * @param userQuantum specified quantum
         */
        Scheduler.prototype.changeQuantum = function (userQuantum) {
            // Change quantum to user given int
            this.quantum = userQuantum;
        };
        /**
         * Change to the specified algorithm
         * @param algorithm
         */
        Scheduler.prototype.changeAlgorithm = function (algorithm) {
            this.algorithm = algorithm;
        };
        /**
         * This gets called by the krnTimerISR
         */
        Scheduler.prototype.contextSwitch = function () {
            if (_MemoryManager.runningProcess != null) {
                // Set CPU to !isExecuting
                _CPU.isExecuting = false;
                // Save CPU info to PCB
                _MemoryManager.runningProcess.acc = _CPU.acc;
                _MemoryManager.runningProcess.PC = _CPU.pc;
                _MemoryManager.runningProcess.IR = _Memory.memoryArray[_CPU.pc];
                _MemoryManager.runningProcess.xReg = _CPU.xReg;
                _MemoryManager.runningProcess.yReg = _CPU.yReg;
                _MemoryManager.runningProcess.zFlag = _CPU.zFlag;
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
        /**
         * Find the highest priority PCB by comparing/sorting each PCB's priorities
         */
        Scheduler.prototype.findHighestPriority = function () {
            var priorityPcb;
            var size = _MemoryManager.readyQueue.getSize();
            for (var i = 0; i < size; i++) {
                var pcb = _MemoryManager.readyQueue.dequeue();
                if (priorityPcb == null) {
                    priorityPcb = pcb;
                }
                else {
                    if (pcb.Priority < priorityPcb.Priority) {
                        // Put the process back into the ready queue
                        _MemoryManager.readyQueue.enqueue(priorityPcb);
                        priorityPcb = pcb;
                    }
                    else {
                        _MemoryManager.readyQueue.enqueue(pcb);
                    }
                }
            }
            return priorityPcb;
        };
        /**
         * Find the lowest priority PCB by comparing/sorting each PCB's priorities
         */
        Scheduler.prototype.findLowestPriority = function () {
            var priorityPcb;
            var size = _MemoryManager.readyQueue.getSize();
            for (var i = 0; i < size; i++) {
                var pcb = _MemoryManager.readyQueue.dequeue();
                if (priorityPcb == null) {
                    priorityPcb = pcb;
                }
                else {
                    // If priority is higher, Put the process back into the ready queue
                    if (pcb.Priority > priorityPcb.Priority) {
                        _MemoryManager.readyQueue.enqueue(priorityPcb);
                        priorityPcb = pcb;
                    }
                    else {
                        _MemoryManager.readyQueue.enqueue(pcb);
                    }
                }
            }
            return priorityPcb;
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
