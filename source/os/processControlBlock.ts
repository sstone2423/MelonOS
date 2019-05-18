/* ------------
   processControlBlock.ts
   This is the client OS implementation of a PCB
   ------------ */

module TSOS {
    export class ProcessControlBlock {
        pId: number;
        state: string;
        PC: number; // 4 bytes in length
        IR: string; //
        priority: number;
        acc: number; 
        xReg: number;
        yReg: number;
        zFlag: number;
        partition: number;
        swapped: boolean;
        TSB: string;
        turnAroundTime: number;
        waitTime: number;
    
        constructor(processId: number) {
            this.pId = processId;
        }
        
        public init(partition: number): void {
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
        }
    }
}
