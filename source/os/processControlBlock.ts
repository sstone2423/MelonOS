///<reference path="../globals.ts" />

module TSOS {
    export class ProcessControlBlock {
        public pId: number;
        public state: string;
        public PC: number; // 4 bytes in length
        public IR: string; //
        public priority: number;
        public acc: number; 
        public xReg: number;
        public yReg: number;
        public zFlag: number;
        public partition: number;
    
        constructor(public processId) {
            this.pId = processId;
        }
        
        public init(partition: number) {
            this.state = "Ready";
            this.PC = 0;
            this.IR = "00";
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.partition = partition;
            this.priority = 1;
        }
    }
}
