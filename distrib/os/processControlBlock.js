///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(processId) {
            this.processId = processId;
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
        };
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
