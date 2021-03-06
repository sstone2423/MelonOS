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
var TSOS;
(function (TSOS) {
    var Disk = /** @class */ (function () {
        function Disk() {
            this.totalTracks = 4;
            this.totalSectors = 8;
            this.totalBlocks = 8;
            this.dataSize = 60;
        }
        /**
         * Initialize storage and set session storage key
         */
        Disk.prototype.init = function () {
            // Initialize storage
            for (var i = 0; i < this.totalTracks; i++) {
                for (var j = 0; j < this.totalSectors; j++) {
                    for (var k = 0; k < this.totalBlocks; k++) {
                        var key = i + ":" + j + ":" + k;
                        var zeroes = [];
                        for (var l = 0; l < this.dataSize; l++) {
                            zeroes.push("00");
                        }
                        var block = {
                            availableBit: "0",
                            pointer: "0:0:0",
                            data: zeroes // Rest of 64 bytes is filled with data
                        };
                        // Set the session storage key
                        sessionStorage.setItem(key, JSON.stringify(block));
                    }
                }
            }
        };
        return Disk;
    }());
    TSOS.Disk = Disk;
})(TSOS || (TSOS = {}));
