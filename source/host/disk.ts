///<reference path="../globals.ts" />
/* ------------
     disk.ts
     Requires global.ts.
     Contains 3 tracks, with 8 sectors each, each with 8 bytes
     Routines for the host disk simulation, NOT for the OS itself. In this manner, it's A LITTLE 
     BIT like a hypervisor, in that the Document environment inside a browser is the "bare metal" 
     (so to speak) for which we write code that hosts our client OS. But that analogy only goes 
     so far, and the lines are blurred, because we are using TypeScript/JavaScript in both the 
     host and client environments.
     ------------ */

module TSOS {
    export class Disk {
        totalTracks = 4;
        totalSectors = 8;
        totalBlocks = 8;
        dataSize = 60;

        /**
         * Initialize storage and set session storage key
         */
        init(): void {
            // Initialize storage
            for (let i = 0; i < this.totalTracks; i++) {
                for (let j = 0; j < this.totalSectors; j++) {
                    for (let k = 0; k < this.totalBlocks; k++) {
                        const key = i + ":" + j + ":" + k;
                        const zeroes: Array<String> = [];

                        for (let l = 0; l < this.dataSize; l++) {
                            zeroes.push("00");
                        }
                        const block = {
                            availableBit : "0", // Flags a block as available or not
                            pointer: "0:0:0", // Pointer to next data block
                            data: zeroes // Rest of 64 bytes is filled with data
                        };
                        // Set the session storage key
                        sessionStorage.setItem(key, JSON.stringify(block));
                    }
                }
            }
        }
    }
}
