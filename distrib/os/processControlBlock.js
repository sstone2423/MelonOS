///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(processId, state, PC, // program counter
        IR, // instruction register
        priority, ACC, xReg, yReg, zFlag) {
            if (processId === void 0) { processId = 0; }
            if (state === void 0) { state = "Ready"; }
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = "00"; }
            if (priority === void 0) { priority = 1; }
            if (ACC === void 0) { ACC = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            this.processId = processId;
            this.state = state;
            this.PC = PC;
            this.IR = IR;
            this.priority = priority;
            this.ACC = ACC;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
        }
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
