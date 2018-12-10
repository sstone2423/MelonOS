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

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }

        public krnDiskDriverEntry(): void {
            // Initialization routine for this, the kernel-mode Disk Device Driver.
            this.status = "loaded";
            // More?
        }

        // Creates a new file with specified filename
        public createFile(filename: String) {
            // Check for existing filename
            
            // Look for first free block in directory data structure (first track)
            // Leave out the first block, which is the MBR
            // Firefox doesn't order session storage, so have to generate appropriate tsbID
            for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                    if (sectorNum == 0 && blockNum == 0) {
                        // ignore first block in first sector, it is the MBR
                        continue;
                    }
                    let tsbID = "0" + ":" + sectorNum + ":" + blockNum;
                    let dirBlock = JSON.parse(sessionStorage.getItem(tsbID));
                    // If the block is available...
                    if (dirBlock.availableBit == "0") {
                        // Now look for first free block in data structure so we actually have a "place" to put the file
                        //let dataBlockTSB = this.findFreeDataBlock();
                        if (dataBlockTSB != null) {
                            let dataBlock = JSON.parse(sessionStorage.getItem(dataBlockTSB));
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
                            let today = new Date();
                            let month = (today.getMonth()+1).toString(16);
                            if (month.length == 1) {
                                month = "0" + month; // pad with zero
                            }
                            let day = (today.getDate()).toString(16);
                            if (day.length == 1) {
                                day = "0" + day; // pad with zero
                            }
                            let year = (today.getFullYear()).toString(16);
                            if (year.length == 3) {
                                year = "0" + year; // pad with zero
                            }
                            // Store date in first 4 bytes
                            dirBlock.data[0] = month;
                            dirBlock.data[1] = day;
                            dirBlock.data[2] = year.substring(0,2);
                            dirBlock.data[3] = year.substring(2);
                            // We only replace the bytes needed, not the entire data array
                            for (let k = 4, j = 0; j < hexArr.length; k++, j++){
                                dirBlock.data[k] = hexArr[j];
                            }
                            sessionStorage.setItem(tsbID, JSON.stringify(dirBlock));
                            sessionStorage.setItem(dataBlockTSB, JSON.stringify(dataBlock));
                            // Update the disk display and return success
                            Control.hostDisk();
                            //return FILE_SUCCESS;
                        }
                        //return FULL_DISK_SPACE; // We ran through the data structure but there were no free blocks, meaning no more space on disk
                    }
                }
            }
            //return FULL_DISK_SPACE; // We ran through the directory data structure but there were no free blocks, meaning no more space on disk
        }
    }
}