///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="../utils.ts" />
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
            var check = this.checkForExistingFile(filename);
            // Check for existing filename
            if (check.matchingFileName) {
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
                            var hexArray = TSOS.Utils.stringToASCIItoHex(filename);
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
            var check;
            var hexArray = TSOS.Utils.stringToASCIItoHex(filename);
            for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    var tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    var dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    var matchingFileName = true;
                    check = {
                        "tsbId": tsbId,
                        "matchingFileName": matchingFileName
                    };
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        for (var k = 4, j = 0; j < hexArray.length; k++, j++) {
                            if (hexArray[j] != dirBlock.data[k]) {
                                check.matchingFileName = false;
                            }
                        }
                        // If we reach the end of the dirBlock, return false
                        if (dirBlock.data[hexArray.length + 4] != "00") {
                            check.matchingFileName = false;
                        }
                        // If found, return check
                        if (check.matchingFileName) {
                            return check;
                        }
                    }
                }
            }
            check.matchingFileName = false;
            return check;
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
            var hexArray = TSOS.Utils.stringToASCIItoHex(filename);
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
                            dirBlock.pointer = "0:0:0";
                            // Set in storage
                            sessionStorage.setItem(tsbId, JSON.stringify(dirBlock));
                            // Update display
                            TSOS.Control.hostDisk();
                            return SUCCESS;
                        }
                    }
                }
            }
            return FILENAME_DOESNT_EXIST;
        };
        // Recursively deletes from a given TSB
        DeviceDriverDisk.prototype.deleteData = function (pointer_tsb) {
            // Block that belongs to the TSB
            var ptrBlock = JSON.parse(sessionStorage.getItem(pointer_tsb));
            if (ptrBlock.pointer != "0:0:0") {
                // Recursion for daysss
                this.deleteData(ptrBlock.pointer);
            }
            ptrBlock.pointer = "0:0:0";
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
        // Returns an array of filenames currently on disk
        DeviceDriverDisk.prototype.listFiles = function () {
            var filenames = [];
            // Look for first free block in directory data structure (first track)
            for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    var tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    var dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        var size = this.getTsbSize(dirBlock.pointer);
                        var info = {
                            data: dirBlock.data,
                            size: size + " bytes"
                        };
                        filenames.push(info);
                    }
                }
            }
            // Convert all hex filenames to human-readable form
            for (var i = 0; i < filenames.length; i++) {
                var dataPtr = 4;
                // Filename
                var info = [];
                while (true) {
                    if (filenames[i]['data'][dataPtr] != "00") {
                        // Push each character into array
                        info.push(String.fromCharCode(parseInt(filenames[i]['data'][dataPtr], 16)));
                        dataPtr++;
                    }
                    else {
                        break;
                    }
                }
                filenames[i]['name'] = info.join("");
                // Parse out the date
                filenames[i]['month'] = parseInt(filenames[i]['data'][0], 16);
                filenames[i]['day'] = parseInt(filenames[i]['data'][1], 16);
                filenames[i]['year'] = parseInt(filenames[i]['data'][2] + filenames[i]['data'][3], 16);
            }
            // Return array of filenames
            return filenames;
        };
        // Read a file from disk
        DeviceDriverDisk.prototype.readFile = function (filename) {
            var check = this.checkForExistingFile(filename);
            var info;
            // If name is found
            if (check.matchingFileName) {
                var dirBlock = JSON.parse(sessionStorage.getItem(check.tsbId));
                // Perform a recursive read
                var tsb = dirBlock.pointer;
                var data = this.readData(tsb);
                var dataPtr = 0;
                var fileData = [];
                var end = false;
                while (!end) {
                    // Read until we reach 00-terminated string
                    if (data[dataPtr] != "00") {
                        // Push each character into array
                        fileData.push(String.fromCharCode(parseInt(data[dataPtr], 16)));
                        dataPtr++;
                    }
                    else {
                        end = true;
                    }
                }
                info = {
                    "status": SUCCESS,
                    "data": data,
                    "fileData": fileData
                };
                // Return success and data
                return info;
            }
            else {
                info = {
                    "status": FILENAME_DOESNT_EXIST
                };
                // Return failure
                return info;
            }
        };
        DeviceDriverDisk.prototype.readData = function (tsb) {
            var dataBlock = JSON.parse(sessionStorage.getItem(tsb));
            var dataPtr = 0;
            // Hex array of data
            var data = [];
            var end = false;
            // Read until we reach end of the data block
            while (!end) {
                data.push(dataBlock.data[dataPtr]);
                dataPtr++;
                if (dataPtr == _Disk.dataSize) {
                    // Go to next TSB if there is a pointer to it.
                    if (dataBlock.pointer != "0:0:0") {
                        dataBlock = JSON.parse(sessionStorage.getItem(dataBlock.pointer));
                        dataPtr = 0;
                    }
                    else {
                        end = true;
                    }
                }
            }
            return data;
        };
        // Write to a file on disk
        DeviceDriverDisk.prototype.writeFile = function (filename, data) {
            var check = this.checkForExistingFile(filename);
            // If name is found
            if (check.matchingFileName) {
                var dirBlock = JSON.parse(sessionStorage.getItem(check.tsbId));
                // Convert the text to a hex array, trimming off quotes
                var dataHexArray = TSOS.Utils.stringToASCIItoHex(data.slice(1, -1));
                // Allocates enough free space for the file
                var freeSpace = this.allocateDiskSpace(dataHexArray, dirBlock.pointer);
                if (!freeSpace) {
                    return DISK_IS_FULL;
                }
                // We have enough allocated space. Get the first datablock, keep writing until finished
                this.writeDataToFile(dirBlock.pointer, dataHexArray);
                return SUCCESS;
            }
            else {
                return FILENAME_DOESNT_EXIST;
            }
        };
        // Write data to a file on disk
        DeviceDriverDisk.prototype.writeDataToFile = function (tsb, dataHexArray) {
            var dataPtr = 0;
            var currentTSB = tsb;
            var currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
            // First, clear out any data that was there previously
            currentBlock = this.clearData(currentBlock);
            for (var i = 0; i < dataHexArray.length; i++) {
                currentBlock.data[dataPtr] = dataHexArray[i];
                dataPtr++;
                // Check to see if we've reached the limit of what data the block can hold. If so, go to the next block.
                if (dataPtr == 60) {
                    // Set the block in session storage first
                    sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
                    currentTSB = currentBlock.pointer;
                    currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                    currentBlock = this.clearData(currentBlock);
                    dataPtr = 0;
                }
            }
            // If we're done writing, but the pointer in the current block is still pointing to something, it means the old file was longer
            // so delete it all.
            this.deleteData(currentBlock.pointer);
            currentBlock.pointer = "0:0:0";
            // Update session storage
            sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
            // Update disk display
            TSOS.Control.hostDisk();
        };
        DeviceDriverDisk.prototype.getTsbSize = function (tsb) {
            return this.readData(tsb).length;
        };
        DeviceDriverDisk.prototype.allocateDiskSpace = function (file, tsb) {
            // Check size of text. If it is longer than 60, then we need to have enough datablocks
            var stringLength = file.length;
            // pointer to current block we're looking at
            var dataBlockTSB = tsb;
            var dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB));
            // If data block we're writing to is already pointing to something, we need to traverse it.
            // Making sure there is enough space to hold our new file. Continuously allocate new blocks
            while (stringLength > _Disk.dataSize) {
                // If pointer is 0:0:0, then we need to find free blocks
                if (dataBlock.pointer != "0:0:0" && dataBlock.availableBit == "1") {
                    stringLength -= _Disk.dataSize;
                    // dataBlock.availableBit = "1";
                    // sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                    // Update pointers
                    dataBlockTSB = dataBlock.pointer;
                    dataBlock = JSON.parse(sessionStorage.getItem(dataBlock.pointer));
                }
                else {
                    // We reached the end of the blocks that have already been allocated for this file
                    // Mark the starting block as in use
                    dataBlock.availableBit = "1";
                    // Find enough free data blocks, if can't, return error
                    // First, find out how many more datablocks we need
                    var numBlocks = Math.ceil(stringLength / _Disk.dataSize);
                    // Go find that number of free blocks
                    var freeBlocks = this.findFreeDataBlocks(numBlocks);
                    if (freeBlocks != null) {
                        // Once we get those n blocks, mark them as used, then set their pointers accordingly.
                        // Set the current block's pointer to the first block in the array, then recursively set pointers
                        for (var _i = 0, freeBlocks_1 = freeBlocks; _i < freeBlocks_1.length; _i++) {
                            var block = freeBlocks_1[_i];
                            dataBlock.pointer = block;
                            dataBlock.availableBit = "1";
                            // Set in session storage
                            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                            dataBlockTSB = block;
                            dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB));
                        }
                        dataBlock.availableBit = "1";
                        sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                        return true;
                        // Not enough free blocks for this file
                    }
                    else {
                        dataBlock.availableBit = "0";
                        return false;
                    }
                }
            }
            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
            return true;
        };
        DeviceDriverDisk.prototype.findFreeDataBlocks = function (numBlocks) {
            var blocks = [];
            var startOfDiskIndex = _Disk.totalSectors * _Disk.totalBlocks;
            var endOfDiskIndex = _Disk.totalTracks * _Disk.totalSectors * _Disk.totalBlocks;
            // Generate proper tsbId
            for (var trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        var tsbId = trackNum + ":" + sectorNum + ":" + blockNum;
                        var dataBlock = JSON.parse(sessionStorage.getItem(tsbId));
                        // If the block is available, push it to the array of free blocks we can use
                        if (dataBlock.availableBit == "0") {
                            blocks.push(tsbId);
                            numBlocks--;
                        }
                        // We found enough free blocks
                        if (numBlocks == 0) {
                            return blocks;
                        }
                    }
                }
            }
            if (numBlocks != 0) {
                return null;
            }
        };
        DeviceDriverDisk.prototype.writeSwap = function (filename, opCodes) {
            var check = this.checkForExistingFile(filename);
            if (check.matchingFileName) {
                // Allocates enough free space for the file
                var dirBlock = JSON.parse(sessionStorage.getItem(check.tsbId));
                var dataBlock = JSON.parse(sessionStorage.getItem(dirBlock.pointer));
                dataBlock.availableBit = "0";
                sessionStorage.setItem(dirBlock.pointer, JSON.stringify(dataBlock));
                var freeSpace = this.allocateDiskSpace(opCodes, dirBlock.pointer);
                if (!freeSpace) {
                    return DISK_IS_FULL;
                }
                // We have enough allocated space. Get the first datablock, keep writing until no more string.
                this.writeDataToFile(dirBlock.pointer, opCodes);
                return SUCCESS;
            }
            return FILENAME_DOESNT_EXIST;
        };
        return DeviceDriverDisk;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverDisk = DeviceDriverDisk;
})(TSOS || (TSOS = {}));
