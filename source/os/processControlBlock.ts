///<reference path="../globals.ts" />

module TSOS {
    export class ProcessControlBlock {

        constructor(public processId = 0,
            public state = "Ready",
            public PC = 0, // program counter
            public IR = "00", // instruction register
            public priority = 1,
            public ACC = 0,
            public xReg = 0,
            public yReg = 0,
            public zFlag = 0) {
        } 
    }
}
