///<reference path="../globals.ts" />

/* ------------
     Memory.ts

     Requires global.ts.

     ------------ */

     module TSOS {

        export class Memory {
            constructor(public memoryArray = []) {
            }
            
            // Initializa the memory with 786 bytes
            public init(): void {
                this.memoryArray = new Array(768);

                // Initialize memory with 00's
                for (let i = 0; i < this.memoryArray.length; i++) {
                    this.memoryArray[i] = "00";
                }
            }
        }
    }