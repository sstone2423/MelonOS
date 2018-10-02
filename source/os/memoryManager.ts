///<reference path="../globals.ts" />
///<reference path="queue.ts" />

   module TSOS {
    export class MemoryManager {

        // Initialize variables
        public residentQueue = new TSOS.Queue;
        public readyQueue = new TSOS.Queue;
        public processIncrementor = 0;
        public base = 0;
        public limit = 0;
        
        public uploadProgram(programArray): void {
            // Copy the textsplit program to the memoryArray
            for (let i = 0; i < programArray.length; i++) {
                _Memory.memoryArray[i] = programArray[i];
            }
            // Create a new PCB for the process
            let currentPCB = new TSOS.ProcessControlBlock();
            // Change the PID
            currentPCB.processId = this.processIncrementor;
            // Increment the PID
            this.processIncrementor++;
            // Set the limit
            this.limit = _Memory.memoryArray.length;

        }
    }
}
