///<reference path="../globals.ts" />

module TSOS {
    export class ProcessControlBlock {
    
        constructor(public pId: number,
            public state: String = "Ready",
            public PC: number = 0,
            public IR: String = "00",
            public priority: number = 1,
            public Acc: number = 0,
            public xReg: number = 0,
            public yReg: number = 0,
            public zFlag: number = 0
            ) {
            
        }

    }


}
