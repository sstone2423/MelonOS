///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var ProcessControlBlock = /** @class */ (function () {
        function ProcessControlBlock(pId, state, PC, IR, priority, Acc, xReg, yReg, zFlag) {
            if (state === void 0) { state = "Ready"; }
            if (PC === void 0) { PC = 0; }
            if (IR === void 0) { IR = "00"; }
            if (priority === void 0) { priority = 1; }
            if (Acc === void 0) { Acc = 0; }
            if (xReg === void 0) { xReg = 0; }
            if (yReg === void 0) { yReg = 0; }
            if (zFlag === void 0) { zFlag = 0; }
            this.pId = pId;
            this.state = state;
            this.PC = PC;
            this.IR = IR;
            this.priority = priority;
            this.Acc = Acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
        }
        return ProcessControlBlock;
    }());
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
