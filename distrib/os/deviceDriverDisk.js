///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverDisk.ts
   Requires deviceDriver.ts
   The Hard Drive Disk Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverDisk = /** @class */ (function (_super) {
        __extends(DeviceDriverDisk, _super);
        function DeviceDriverDisk() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            _super.call(this) || this;
            _this.driverEntry = _this.krnDiskDriverEntry;
            return _this;
        }
        DeviceDriverDisk.prototype.krnDiskDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        };
        // Creates a new file with specified filename
        DeviceDriverDisk.prototype.createFile = function (filename) {
            // Check for existing filename
            // Look for first free block in directory data structure (first track)
            // Leave out the first block, which is the MBR
            // Firefox doesn't order session storage, so have to generate appropriate tsbID
            for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    if (sectorNum == 0 && blockNum == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    var tsbID = "0" + ":" + sectorNum + ":" + blockNum;
                    var dirBlock = JSON.parse(sessionStorage.getItem(tsbID));
                    // If the block is available...
                    if (dirBlock.availableBit == "0") {
                        // Now look for first free block in data structure so we actually have a "place" to put the file
                        //let dataBlockTSB = this.findFreeDataBlock();
                        if (dataBlockTSB != null) {
                            var dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB));
                            dirBlock.availableBit = "1";
                            dataBlock.availableBit = "1";
                            // Clear out any data previously in datBlock
                            //dataBlock = this.clearData(dataBlock);
                            dirBlock.pointer = dataBlockTSB; // set pointer to space in memory
                            // Convert filename to ASCII/hex and store in data
                            //let hexArr = this.stringToASCII(filename);
                            // Clear the directory block's data first a.k.a the filename if it was there before
                            //dirBlock = this.clearData(dirBlock);
                            // Get the date and convert it to hex
                            var today = new Date();
                            var month = (today.getMonth() + 1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month; // pad with zero
                            }
                            var day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day; // pad with zero
                            }
                            var year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year; // pad with zero
                            }
                            // Store date in first 4 bytes
                            dirBlock.data[0] = month;
                            dirBlock.data[1] = day;
                            dirBlock.data[2] = year.substring(0, 2);
                            dirBlock.data[3] = year.substring(2);
                            // We only replace the bytes needed, not the entire data array
                            for (var k = 4, j = 0; j < hexArr.length; k++, j++) {
                                dirBlock.data[k] = hexArr[j];
                            }
                            sessionStorage.setItem(tsbID, JSON.stringify(dirBlock));
                            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                            // Update the disk display and return success
                            TSOS.Control.hostDisk();
                            //return FILE_SUCCESS;
                        }
                        //return FULL_DISK_SPACE; // We ran through the data structure but there were no free blocks, meaning no more space on disk
                    }
                }
            }
            //return FULL_DISK_SPACE; // We ran through the directory data structure but there were no free blocks, meaning no more space on disk
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
