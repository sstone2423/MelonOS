/* ------------
   processControlBlock.ts
   This is the client OS implementation of a PCB
   ------------ */
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(processId) {
            this.pId = processId;
        }
        ProcessControlBlock.prototype.init = function (partition) {
            this.state = "Ready";
            this.PC = 0;
            this.IR = "00";
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.partition = partition;
            this.priority = 1;
            this.turnAroundTime = 0;
            this.waitTime = 0;
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
