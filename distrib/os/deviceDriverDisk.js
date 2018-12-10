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
            var _this = 
            // Override the base method pointers.
            // The code below cannot run because "this" can only be accessed after calling super.
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
            if (this.checkForExistingFile(filename)) {
                return FILENAME_EXISTS;
            }
            // Look for first free block in directory data structure (first track)
            for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    var tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    var dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    // If the block is available
                    if (dirBlock.availableBit == "0") {
                        // Look for first free block in data structure to put the file
                        var dataBlockTSB = this.findFreeDataBlock();
                        if (dataBlockTSB != null) {
                            var dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB));
                            dirBlock.availableBit = "1";
                            dataBlock.availableBit = "1";
                            // Clear out any data previously in dataBlock and return the block
                            dataBlock = this.clearData(dataBlock);
                            // Set pointer to space in memory
                            dirBlock.pointer = dataBlockTSB;
                            // Convert filename to hex and store in data
                            var hexArray = _Utils.stringToASCIItoHex(filename);
                            // Clear the directory block's data
                            dirBlock = this.clearData(dirBlock);
                            // Get the date and convert it to hex
                            var today = new Date();
                            var month = (today.getMonth() + 1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month;
                            }
                            var day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day;
                            }
                            var year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year;
                            }
                            // Store date in first 4 bytes
                            dirBlock.data[0] = month;
                            dirBlock.data[1] = day;
                            dirBlock.data[2] = year.substring(0, 2);
                            dirBlock.data[3] = year.substring(2);
                            // We only replace the bytes needed, not the entire data array
                            for (var k = 4, j = 0; j < hexArray.length; k++, j++) {
                                dirBlock.data[k] = hexArray[j];
                            }
                            sessionStorage.setItem(tsbId, JSON.stringify(dirBlock));
                            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                            // Update the disk display and return success
                            TSOS.Control.hostDisk();
                            return SUCCESS;
                        }
                        return DISK_IS_FULL; // We ran through the data structure but there were no free blocks, meaning no more space on disk
                    }
                }
            }
            return DISK_IS_FULL; // We ran through the directory data structure but there were no free blocks, meaning no more space on disk
        };
        DeviceDriverDisk.prototype.checkForExistingFile = function (filename) {
            var hexArray = _Utils.stringToASCIItoHex(filename);
            for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    var tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    var dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    var matchingFileName = true;
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArray.length; k++, j++) {
                            if (hexArray[j] != dirBlock.data[k]) {
                                matchingFileName = false;
                            }
                        }
                        // If we reach the end of the dirBlock, return false
                        if (dirBlock.data[hexArray.length + 4] != "00") {
                            matchingFileName = false;
                        }
                        // If found, return true
                        if (matchingFileName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        // Return the TSB of the next free data block. If can't find, return null.
        DeviceDriverDisk.prototype.findFreeDataBlock = function () {
            // Generate tsbId
            for (var trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        var tsbId = trackNum + ":" + sectorNum + ":" + blockNum;
                        var dataBlock = JSON.parse(sessionStorage.getItem(tsbId));
                        // If the block is available, mark it as unavailable, and set its tsb to the dirBlock pointer
                        if (dataBlock.availableBit == "0") {
                            return tsbId;
                        }
                    }
                }
            }
            return null;
        };
        // Sets a block's bytes to all zeroes and returns the initialized block
        DeviceDriverDisk.prototype.clearData = function (block) {
            for (var i = 0; i < _Disk.dataSize; i++) {
                block.data[i] = "00";
            }
            return block;
        };
        // Delete a file with the specified filename
        DeviceDriverDisk.prototype.deleteFile = function (filename) {
            // Look for the filename in the directory structure
            var hexArray = _Utils.stringToASCIItoHex(filename);
            // Look for first free block in directory data structure (first track)
            for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    var tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    var dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    var matchingFileName = true;
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArray.length; k++, j++) {
                            if (hexArray[j] != dirBlock.data[k]) {
                                matchingFileName = false;
                            }
                        }
                        // If we reach the end of the dirBlock, return false
                        if (dirBlock.data[hexArray.length + 6] != "00") {
                            matchingFileName = false;
                        }
                        // If filename was found
                        if (matchingFileName) {
                            // Perform recursive delete given first TSB
                            this.deleteData(dirBlock.pointer);
                            // Update directory block
                            dirBlock.availableBit = "0";
                            // Keep the pointer for chkdsk
                            // dirBlock.pointer = "0:0:0"; 
                            // Set in storage
                            sessionStorage.setItem(tsbId, JSON.stringify(dirBlock));
                            // Update display
                            TSOS.Control.hostDisk();
                            return SUCCESS;
                        }
                    }
                }
            }
            return FILENAME_NOT_EXISTS;
        };
        // Recursively deletes from a given TSB
        DeviceDriverDisk.prototype.deleteData = function (pointer_tsb) {
            // Block that belongs to the TSB
            var ptrBlock = JSON.parse(sessionStorage.getItem(pointer_tsb));
            if (ptrBlock.pointer != "0:0:0") {
                // follow links
                this.deleteData(ptrBlock.pointer);
            }
            // ptrBlock.pointer = "0:0:0";
            // Set the block to available
            ptrBlock.availableBit = "0";
            // Update the item in sessionStorage
            sessionStorage.setItem(pointer_tsb, JSON.stringify(ptrBlock));
            return;
        };
        // Format the disk with the specified format
        DeviceDriverDisk.prototype.format = function (formatType) {
            // If CPU is executing, return false
            if (_CPU.isExecuting) {
                return false;
            }
            // If quick format, set pointers to 0 and available bit to 0
            if (formatType == QUICK_FORMAT) {
                for (var i = 0; i < _Disk.totalTracks * _Disk.totalSectors * _Disk.totalBlocks; i++) {
                    // Get the JSON from the stored string
                    var block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.availableBit = "0";
                    block.pointer = "0:0:0";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
                // Default to full format
            }
            else {
                // For all values in session storage, set available bit to 0, pointer to 0,0,0, and fill data with 00s
                var zeroes = [];
                for (var i = 0; i < 60; i++) {
                    zeroes.push("00");
                }
                for (var j = 0; j < _Disk.totalTracks * _Disk.totalSectors * _Disk.totalBlocks; j++) {
                    // Get the JSON from the stored string
                    var block = JSON.parse(sessionStorage.getItem(sessionStorage.key(j)));
                    block.availableBit = "0";
                    block.pointer = "0:0:0";
                    block.data = zeroes;
                    sessionStorage.setItem(sessionStorage.key(j), JSON.stringify(block));
                }
            }
            // Format should also remove any processes that are swapped from the resident queue
            var size = _MemoryManager.residentQueue.getSize();
            for (var i = 0; i < size; i++) {
                var pcb = _MemoryManager.residentQueue.dequeue();
                if (pcb.Swapped) {
                    // Do nothing
                }
                else {
                    // Put the process back into the resident queue
                    _MemoryManager.residentQueue.enqueue(pcb);
                }
            }
            // Update disk display
            TSOS.Control.hostDisk();
            return true;
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
