///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

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
            // The code below cannot run because "this" can only be accessed after calling super.
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry(): void {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }

        // Creates a new file with specified filename
        public createFile(filename: String): number {
            // Check for existing filename
            if (this.checkForExistingFile(filename)) {
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
                            let hexArray = _Utils.stringToASCIItoHex(filename);
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
                        return DISK_IS_FULL; // We ran through the data structure but there were no free blocks, meaning no more space on disk
                    }
                }
            }
            return DISK_IS_FULL; // We ran through the directory data structure but there were no free blocks, meaning no more space on disk
        }

        public checkForExistingFile(filename: String): boolean {
            let hexArray = _Utils.stringToASCIItoHex(filename);
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
                                matchingFileName = false
                            }
                        }
                        // If we reach the end of the dirBlock, return false
                        if (dirBlock.data[hexArray.length + 4] != "00") {
                            matchingFileName = false;
                        }
                        // If found, return true
                        if (matchingFileName){ 
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // Return the TSB of the next free data block. If can't find, return null.
        public findFreeDataBlock() {
            // Generate tsbId
            for (let trackNum = 1; trackNum < _Disk.totalTracks; trackNum++) {
                for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        let tsbId = trackNum + ":" + sectorNum + ":" + blockNum;
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

        // Sets a block's bytes to all zeroes and returns the initialized block
        public clearData(block) {
            for (let i = 0; i < _Disk.dataSize; i++) {
                block.data[i] = "00";
            }
            return block;
        }

        // Delete a file with the specified filename
        public deleteFile(filename: string): number {
            // Look for the filename in the directory structure
            let hexArray = _Utils.stringToASCIItoHex(filename);
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
                            // Keep the pointer for chkdsk
                            // dirBlock.pointer = "0:0:0"; 
                            // Set in storage
                            sessionStorage.setItem(tsbId, JSON.stringify(dirBlock));
                            // Update display
                            Control.hostDisk();

                            return SUCCESS;
                        }
                    }
                }
            }
            return FILENAME_NOT_EXISTS;
        }

        // Recursively deletes from a given TSB
        public deleteData(pointer_tsb): void {
            // Block that belongs to the TSB
            let ptrBlock = JSON.parse(sessionStorage.getItem(pointer_tsb)); 
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
        }

        // Format the disk with the specified format
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
                for (let i = 0; i < 60; i++) {
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
                    // Do nothing
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
    }
}