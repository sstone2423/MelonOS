///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="../utils.ts" />
/* ----------------------------------
   DeviceDriverDisk.ts
   Requires deviceDriver.ts
   The Hard Drive Disk Device Driver.
   ---------------------------------- */

module TSOS {
    // Extends DeviceDriver
    export class DeviceDriverDisk extends DeviceDriver {
        constructor() {
            // Override the base method pointers.
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        /**
         * Initialization routine for this, the kernel-mode Disk Device Driver.
         */
        public krnDiskDriverEntry(): void {
            this.status = "loaded";
            // More?
        }

        /**
         * Creates a new file with specified filename
         * @param filename 
         */
        public createFile(filename: String): number {
            let check = this.checkForExistingFile(filename);
            // Check for existing filename
            if (check.matchingFileName) {
                return FILENAME_EXISTS;
            }
            
            // Look for first free block in directory data structure (first track)
            for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    let tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    // If the block is available
                    if (dirBlock.availableBit == "0") {
                        // Look for first free block in data structure to put the file
                        let dataBlockTSB = this.findFreeDataBlock();
                        if (dataBlockTSB != null) {
                            let dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB));
                            dirBlock.availableBit = "1";
                            dataBlock.availableBit = "1";
                            // Clear out any data previously in dataBlock and return the block
                            dataBlock = this.clearData(dataBlock);
                            // Set pointer to space in memory
                            dirBlock.pointer = dataBlockTSB;
                            // Convert filename to hex and store in data
                            let hexArray = Utils.stringToASCIItoHex(filename);
                            // Clear the directory block's data
                            dirBlock = this.clearData(dirBlock);
                            // Get the date and convert it to hex
                            let today = new Date();
                            let month = (today.getMonth()+1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month;
                            }
                            let day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day;
                            }
                            let year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year;
                            }
                            // Store date in first 4 bytes
                            dirBlock.data[0] = month;
                            dirBlock.data[1] = day;
                            dirBlock.data[2] = year.substring(0,2);
                            dirBlock.data[3] = year.substring(2);
                            // We only replace the bytes needed, not the entire data array
                            for (let k = 4, j = 0; j < hexArray.length; k++, j++){
                                dirBlock.data[k] = hexArray[j];
                            }
                            sessionStorage.setItem(tsbId, JSON.stringify(dirBlock));
                            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                            // Update the disk display and return success
                            Control.hostDisk();
                            return SUCCESS;
                        }
                        // We ran through the data structure but there were no free blocks, meaning no more space on disk
                        return DISK_IS_FULL;
                    }
                }
            }
            // We ran through the data structure but there were no free blocks, meaning no more space on disk
            return DISK_IS_FULL;
        }

        /**
         * Checks for an existing filename on disk. Returns a status object
         * @param filename 
         */
        public checkForExistingFile(filename: String) {
            let check;
            let hexArray = Utils.stringToASCIItoHex(filename);
            for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    let tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    let matchingFileName = true;
                    check = {
                        "tsbId": tsbId,
                        "matchingFileName": matchingFileName
                    }
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        for (let k = 4, j = 0; j < hexArray.length; k++, j++){
                            if (hexArray[j] != dirBlock.data[k]) {
                                check.matchingFileName = false;
                            }
                        }
                        // If we reach the end of the dirBlock, return false
                        if (dirBlock.data[hexArray.length + 4] != "00") {
                            check.matchingFileName = false;
                        }
                        // If found, return check
                        if (check.matchingFileName){ 
                            return check;
                        }
                    }
                }
            }
            check.matchingFileName = false;
            return check;
        }

        /**
         * Return the TSB of the next free data block. If it can't find one, return null.
         */
        public findFreeDataBlock() {
            // Generate tsbId
            for (let trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        let tsbId: string = trackNum + ":" + sectorNum + ":" + blockNum;
                        let dataBlock = JSON.parse(sessionStorage.getItem(tsbId));
                        // If the block is available, mark it as unavailable, and set its tsb to the dirBlock pointer
                        if (dataBlock.availableBit == "0") {
                            return tsbId;
                        }
                    }
                }
            }
            return null;
        }

        /**
         * Sets a block's bytes to all zeroes and returns the initialized block
         * @param block 
         */
        public clearData(block) {
            for (let i = 0; i < _Disk.dataSize; i++) {
                block.data[i] = "00";
            }
            return block;
        }

        /**
         * Delete a file with the specified filename
         * @param filename 
         */
        public deleteFile(filename: string): number {
            // Look for the filename in the directory structure
            let hexArray = Utils.stringToASCIItoHex(filename);
            // Look for first free block in directory data structure (first track)
            for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    let tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbId));
                    let matchingFileName = true;
                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        for (let k = 4, j = 0; j < hexArray.length; k++, j++){
                            if (hexArray[j] != dirBlock.data[k]) {
                                matchingFileName = false;
                            }
                        }
                        // If we reach the end of the dirBlock, return false
                        if(dirBlock.data[hexArray.length + 6] != "00"){
                            matchingFileName = false;
                        }
                        // If filename was found
                        if (matchingFileName) {
                            // Perform recursive delete given first TSB
                            this.deleteData(dirBlock.pointer);
                            // Update directory block
                            dirBlock.availableBit = "0"
                            dirBlock.pointer = "0:0:0"; 
                            // Set in storage
                            sessionStorage.setItem(tsbId, JSON.stringify(dirBlock));
                            // Update display
                            Control.hostDisk();

                            return SUCCESS;
                        }
                    }
                }
            }
            return FILENAME_DOESNT_EXIST;
        }

        /**
         * Recursively deletes from a given TSB
         * @param pointer_tsb 
         */
        public deleteData(pointer_tsb): void {
            // Block that belongs to the TSB
            let ptrBlock = JSON.parse(sessionStorage.getItem(pointer_tsb)); 
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
        }

        /**
         * Format the disk with the specified format
         * @param formatType 
         */
        public format(formatType: number): boolean {
            // If CPU is executing, return false
            if (_CPU.isExecuting) {
                return false;
            }
            // If quick format, set pointers to 0 and available bit to 0
            if (formatType == QUICK_FORMAT) {
                for (let i = 0; i < _Disk.totalTracks * _Disk.totalSectors * _Disk.totalBlocks; i++){
                    // Get the JSON from the stored string
                    let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(i)));
                    block.availableBit = "0";
                    block.pointer = "0:0:0";
                    sessionStorage.setItem(sessionStorage.key(i), JSON.stringify(block));
                }
            // Default to full format
            } else {
                // For all values in session storage, set available bit to 0, pointer to 0,0,0, and fill data with 00s
                let zeroes: Array<String> = [];
                for (let i = 0; i < DATA_SIZE; i++) {
                    zeroes.push("00");
                }
                for (let j = 0; j < _Disk.totalTracks * _Disk.totalSectors * _Disk.totalBlocks; j++){
                    // Get the JSON from the stored string
                    let block = JSON.parse(sessionStorage.getItem(sessionStorage.key(j)));
                    block.availableBit = "0";
                    block.pointer = "0:0:0";
                    block.data = zeroes;
                    sessionStorage.setItem(sessionStorage.key(j), JSON.stringify(block));
                }
            }
            // Format should also remove any processes that are swapped from the resident queue
            let size = _MemoryManager.residentQueue.getSize();
            for (let i = 0; i < size; i++) {
                let pcb = _MemoryManager.residentQueue.dequeue();
                if (pcb.Swapped) {
                    // Do nothing. That PCB is gone now
                }
                else {
                    // Put the process back into the resident queue
                    _MemoryManager.residentQueue.enqueue(pcb); 
                }
            }
            // Update disk display
            Control.hostDisk();
            return true;
        }

        /**
         * Returns an array of filenames currently on disk
         */
        public listFiles(): Array<String> {
            let filenames = [];
            // Look for first free block in directory data structure (first track)
            for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    // If first block / MBR, continue to next iteration
                    if (sectorNum == 0 && blockNum == 0) {
                        continue;
                    }
                    let tsbId = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbId));

                    // Don't look in blocks not in use
                    if (dirBlock.availableBit == "1") {
                        let size = this.getTsbSize(dirBlock.pointer);
                        let info = {
                            data: dirBlock.data,
                            size: size + " bytes"
                        }
                        filenames.push(info);
                    }
                }
            }
            // Convert all hex filenames to human-readable form
            for (let i = 0; i < filenames.length; i++) {
                let dataPtr = 4;
                // Filename
                let info = [];
                while (true) {
                    if (filenames[i]['data'][dataPtr] != "00") {
                        // Push each character into array
                        info.push(String.fromCharCode(parseInt(filenames[i]['data'][dataPtr], 16)));
                        dataPtr++; 
                    } else {
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
        }

        /**
         * Read a file from disk by filename
         * @param filename 
         */
        public readFile(filename: String) {
            let check = this.checkForExistingFile(filename);
            let info;
            // If name is found
            if (check.matchingFileName) {
                let dirBlock = JSON.parse(sessionStorage.getItem(check.tsbId));
                // Perform a recursive read
                let tsb = dirBlock.pointer;
                let data = this.readData(tsb);
                let dataPtr = 0;
                let fileData = [];
                let end: boolean = false;
                while (!end) {
                    // Read until we reach 00-terminated string
                    if (data[dataPtr] != "00") {
                        // Push each character into array
                        fileData.push(String.fromCharCode(parseInt(data[dataPtr], 16))); 
                        dataPtr++; 
                    } else {
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
            } else {
                info = {
                    "status": FILENAME_DOESNT_EXIST
                }
                // Return failure
                return info;
            }
        }

        /**
         * Reads data from a specified TSB
         * @param tsb 
         */
        public readData(tsb: string): Array<string> {
            let dataBlock = JSON.parse(sessionStorage.getItem(tsb));
            let dataPtr: number = 0;
            // Hex array of data
            let data = [];
            let end: boolean = false;
            // Read until we reach end of the data block
            while (!end) {
                data.push(dataBlock.data[dataPtr]);
                dataPtr++; 
                if (dataPtr == _Disk.dataSize) {
                    // Go to next TSB if there is a pointer to it.
                    if (dataBlock.pointer != "0:0:0"){
                        dataBlock = JSON.parse(sessionStorage.getItem(dataBlock.pointer));
                        dataPtr = 0;
                    } else {
                        end = true;
                    }
                }
            }
            return data;
        }

        /**
         * Write to a file on disk. Returns status number
         * @param filename 
         * @param data 
         */
        public writeFile(filename: string, data: string): number {
            let check = this.checkForExistingFile(filename);
            // If name is found
            if (check.matchingFileName) {
                let dirBlock = JSON.parse(sessionStorage.getItem(check.tsbId));
                // Convert the text to a hex array, trimming off quotes
                let dataHexArray = Utils.stringToASCIItoHex(data.slice(1, -1));
                // Allocates enough free space for the file
                let freeSpace: boolean = this.allocateDiskSpace(dataHexArray, dirBlock.pointer);
                    if (!freeSpace) {
                        return DISK_IS_FULL;
                    }
                // We have enough allocated space. Get the first datablock, keep writing until finished
                this.writeDataToFile(dirBlock.pointer, dataHexArray);

                return SUCCESS;
            } else {
                return FILENAME_DOESNT_EXIST;
            }
        }

        /**
         * Write data to a file on disk
         * @param tsb 
         * @param dataHexArray 
         */
        public writeDataToFile(tsb: string, dataHexArray: Array<String>): void {
            let dataPtr: number = 0;
            let currentTSB: string = tsb;
            let currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
            // First, clear out any data that was there previously
            currentBlock = this.clearData(currentBlock);
            for (let i = 0; i < dataHexArray.length; i++) {
                currentBlock.data[dataPtr] = dataHexArray[i];
                dataPtr++;
                // Check to see if we've reached the limit of what data the block can hold. If so, go to the next block.
                if (dataPtr == DATA_SIZE) {
                    // Set the block in session storage first
                    sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
                    currentTSB = currentBlock.pointer;
                    currentBlock = JSON.parse(sessionStorage.getItem(currentTSB));
                    currentBlock = this.clearData(currentBlock);
                    dataPtr = 0;
                }
            }
            // If we're done writing, but the pointer in the current block is still 
            // pointing to something, it means the old file was longer so delete it all.
            this.deleteData(currentBlock.pointer);
            currentBlock.pointer = "0:0:0";
            // Update session storage
            sessionStorage.setItem(currentTSB, JSON.stringify(currentBlock));
            // Update disk display
            Control.hostDisk();
        }

        /**
         * Get and return the size of a TSB 
         * @param tsb 
         */
        public getTsbSize(tsb: string): number {
            return this.readData(tsb).length;
        }

        /**
         * Allocate disk space for a file
         * @param file 
         * @param tsb 
         */
        public allocateDiskSpace(file: Array<String>, tsb: string): boolean {
            // Check size of text. If it is longer than 60, then we need to have enough datablocks
            let stringLength = file.length;
            // Pointer to current block we're looking at
            let dataBlockTSB = tsb;
            let dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB)); 
            // If data block we're writing to is already pointing to something, we need to traverse it.
            // Making sure there is enough space to hold our new file. Continuously allocate new blocks
            while (stringLength > _Disk.dataSize) {
                // If pointer is 0:0:0, then we need to find free blocks
                if(dataBlock.pointer != "0:0:0" && dataBlock.availableBit == "1"){
                    stringLength -= _Disk.dataSize;
                    // Update pointers
                    dataBlockTSB = dataBlock.pointer;
                    dataBlock = JSON.parse(sessionStorage.getItem(dataBlock.pointer));
                } else {
                    // We reached the end of the blocks that have already been allocated for this file
                    // Mark the starting block as in use
                    dataBlock.availableBit = "1";
                    // First, find out how many more datablocks we need
                    let numBlocks = Math.ceil(stringLength / _Disk.dataSize);
                    // Go find that number of free blocks
                    let freeBlocks = this.findFreeDataBlocks(numBlocks);
                    if (freeBlocks != null) {
                        // Once we get those n blocks, mark them as used, then set their pointers accordingly.
                        // Set the current block's pointer to the first block in the array, then recursively set pointers
                        for (let block of freeBlocks){
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
                    } else {
                        dataBlock.availableBit = "0";
                        return false;
                    }
                }
            }
            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
            return true;
        }

        /**
         * Find enough free data blocks, if can't, return null
         * @param numBlocksNeeded 
         */
        public findFreeDataBlocks(numBlocksNeeded: number) {
            let blocks = [];
            // Generate proper tsbId
            for (let trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        let tsbId = trackNum + ":" + sectorNum + ":" + blockNum;
                        let dataBlock = JSON.parse(sessionStorage.getItem(tsbId));
                        // If the block is available, push it to the array of free blocks we can use
                        if (dataBlock.availableBit == "0") {
                            blocks.push(tsbId);
                            numBlocksNeeded--;
                        }
                        // We found enough free blocks
                        if (numBlocksNeeded == 0) {
                            return blocks;
                        }
                    }
                }
            }
            if (numBlocksNeeded != 0) {
                return null;
            }
        }
        
        /**
         * Write swap file to Disk
         * @param filename 
         * @param opCodes 
         */
        public writeSwap(filename: String, opCodes: Array<String>): number {
            // Check if the file exists
            let check = this.checkForExistingFile(filename);
            // If it exists, attempt to write to disk
            if (check.matchingFileName) {
                // Allocates enough free space for the file
                let dirBlock = JSON.parse(sessionStorage.getItem(check.tsbId));
                let dataBlock = JSON.parse(sessionStorage.getItem(dirBlock.pointer));
                dataBlock.availableBit = "0";
                sessionStorage.setItem(dirBlock.pointer, JSON.stringify(dataBlock));
                // Check if there is enough space
                let freeSpace: boolean = this.allocateDiskSpace(opCodes, dirBlock.pointer);
                if (!freeSpace) {
                    return DISK_IS_FULL;
                }
                // We have enough allocated space. Get the first datablock, keep writing until no more string.
                this.writeDataToFile(dirBlock.pointer, opCodes);
                return SUCCESS;
            }
            return FILENAME_DOESNT_EXIST;
        }
    }
}