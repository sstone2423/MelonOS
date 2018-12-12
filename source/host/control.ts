///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />

/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {
    
    export class Control {

        // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
        public static hostInit(): void {
            // TODO: Should we move this stuff into a Display Device Driver?
            // Get a global reference to the canvas.
            _Canvas = document.getElementById("display") as HTMLCanvasElement;
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);
            // Clear the log text box. Use the TypeScript cast to HTMLInputElement
            (document.getElementById("taHostLog") as HTMLInputElement).value = "";
            // Set focus on the start button.
            (document.getElementById("btnStartOS") as HTMLInputElement).focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS letiable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }

            // get the Time based on local time
            function displayTime() {
                let date = new Date();
                let utc = date.toLocaleString();
                document.getElementById('currentDate').innerHTML = utc;
                let timeout = setTimeout(displayTime, 500);
            }
    
            displayTime();
        }

        // Updates the taHostLog with OS clock
        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            const clock: number = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            const now: number = new Date().getTime();
            // Build the log string.
            const str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now
                                + " })"  + "\n";
            // Update the log console.
            const taLog = document.getElementById("taHostLog") as HTMLInputElement;
            taLog.value = str + taLog.value;
        }

        // Activated when user clicks start button. Will start the OS.
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            (document.getElementById("btnHaltOS") as HTMLButtonElement).disabled = false;
            (document.getElementById("btnReset") as HTMLButtonElement).disabled = false;
            (document.getElementById("btnSingleStep") as HTMLButtonElement).disabled = false;
            (document.getElementById("btnSingleStep") as HTMLButtonElement).style.backgroundColor = "red";
            (document.getElementById("btnSingleStep") as HTMLButtonElement).style.color = "white";
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu();  // Note: We could simulate multi-core systems by instantiating more than
                                    // one instance of the CPU here.
            _CPU.init();
            // Initialize memory
            _Memory = new Memory();
            _Memory.init();
            this.initMemoryDisplay();
            // Initialize the Disk
            _Disk = new Disk();
            _Disk.init();
            this.initDiskDisplay();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.
        }

        // When user clicks halt, the OS attempts to shutdown
        public static hostBtnHaltOS_click(btn): void {
            this.hostLog("Emergency halt", "host");
            this.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        // When user clicks reset, reload the browser
        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            /* That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
               be reloaded from the server. If it is false or not specified the browser may reload the
               page from its cache, which is not what we want.
            */
        }

        // When user clicks single step, enable the next step button
        public static hostBtnSingleStep_click(btn): void {
            if (!_SingleStep) {
                // Enable the NextStep button
                (document.getElementById("btnNextStep") as HTMLButtonElement).disabled = false;
                _SingleStep = true;
                (document.getElementById("btnSingleStep") as HTMLButtonElement).style.backgroundColor = "green";
            } else {
                // Disable the NextStep button
                (document.getElementById("btnNextStep") as HTMLButtonElement).disabled = true;
                _SingleStep = false;
                (document.getElementById("btnSingleStep") as HTMLButtonElement).style.backgroundColor = "red";
            }
        }

        // When user clicks next step, set to true for CPU clock
        public static hostBtnNextStep_click(btn): void {
            _NextStep = true;
        }

        // Update the CPU display table
        public static hostCPU(): void {
            let table = (<HTMLTableElement>document.getElementById('tableCPU'));
            // Delete the placeholder row
            table.deleteRow(-1);
            // New row appended to table
            let row = table.insertRow(-1);
            // PC
            let cell = row.insertCell();
            cell.innerHTML = _CPU.PC.toString(16).toUpperCase();
            // IR
            cell = row.insertCell();
            if (_CPU.isExecuting) {
                cell.innerHTML = _Memory.memoryArray[_CPU.PC].toString(); 
            } else {
                cell.innerHTML = "0";
            }
            // Acc
            cell = row.insertCell();
            cell.innerHTML = _CPU.Acc.toString(16).toUpperCase();
            // Xreg
            cell = row.insertCell();
            cell.innerHTML = _CPU.Xreg.toString(16).toUpperCase();
            // Yreg
            cell = row.insertCell();
            cell.innerHTML = _CPU.Yreg.toString(16).toUpperCase();
            // Zflag
            cell = row.insertCell();
            cell.innerHTML = _CPU.Zflag.toString(16).toUpperCase();
        }

        // Update the Memory table
        public static hostMemory(): void {
            let table = (<HTMLTableElement>document.getElementById('tableMemory'));
            // Start at PC 0
            let memoryPC = 0;
            for (let i = 0; i < table.rows.length; i++) {
                for (let j = 1; j < 9; j++) {
                    table.rows[i].cells.item(j).innerHTML = _Memory.memoryArray[memoryPC].toString().toUpperCase();
                    // Check to see if the hex needs a leading zero. Convert to decimal, then to hex, then add leading zero
                    let convert = parseInt(_Memory.memoryArray[memoryPC].toString(), 16);
                    if (convert < 16 && convert > 0){
                        table.rows[i].cells.item(j).innerHTML = "0" + convert.toString(16).toUpperCase();
                    }
                    memoryPC++;
                }
            }
        }
        
        // Update the resident queue table
        public static hostProcesses(): void {
            let table = (<HTMLTableElement>document.getElementById('tableProcesses'));
            // Initialize an array of PCBs
            let displayQueue: Array<TSOS.ProcessControlBlock> = [];
            // For each PCB in resident queue, print out a new row for it
            for (let i = 0; i < _MemoryManager.residentQueue.getSize(); i++) {
                let pcb = _MemoryManager.residentQueue.dequeue();
                _MemoryManager.residentQueue.enqueue(pcb);
                displayQueue.push(pcb);
            }
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            // Display all the other PCBs in the Resident queue
            while(displayQueue.length > 0){
                let displayPcb = displayQueue.shift();
                // New row appended to table
                let row = table.insertRow(-1);
                // PID
                let cell = row.insertCell();
                cell.innerHTML = displayPcb.pId.toString(16).toUpperCase();
                // PC
                cell = row.insertCell();
                cell.innerHTML = displayPcb.PC.toString(16).toUpperCase();
                // IR
                cell = row.insertCell();
                cell.innerHTML = displayPcb.IR.toString();
                // Acc
                cell = row.insertCell();
                cell.innerHTML = displayPcb.acc.toString(16).toUpperCase();
                // Xreg
                cell = row.insertCell();
                cell.innerHTML = displayPcb.xReg.toString(16).toUpperCase();
                // Yreg
                cell = row.insertCell();
                cell.innerHTML = displayPcb.yReg.toString(16).toUpperCase();
                // Zflag
                cell = row.insertCell();
                cell.innerHTML = displayPcb.zFlag.toString(16).toUpperCase();
                // State
                cell = row.insertCell();
                cell.innerHTML = displayPcb.state;
                // Priority
                cell = row.insertCell();
                cell.innerHTML = displayPcb.priority.toString();
            }
        }

        // Update the ready queue table
        public static hostReady(): void {
            let table = (<HTMLTableElement>document.getElementById('tableReady'));
            // Initialize an array of PCBs
            let displayQueue: Array<TSOS.ProcessControlBlock> = [];
            // For each PCB in ready queue, print out a new row for it
            for (let i = 0; i < _MemoryManager.readyQueue.getSize(); i++) {
                let pcb = _MemoryManager.readyQueue.dequeue();
                _MemoryManager.readyQueue.enqueue(pcb);
                displayQueue.push(pcb);
            }
            if (_MemoryManager.runningProcess != null) {
                displayQueue.push(_MemoryManager.runningProcess);
            }
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            // Display all the other PCBs in the Resident queue
            while (displayQueue.length > 0) {
                let displayPcb = displayQueue.shift();
                let row = table.insertRow(-1); // New row appended to table
                // PID
                let cell = row.insertCell();
                cell.innerHTML = displayPcb.pId.toString(16).toUpperCase();
                // PC
                cell = row.insertCell();
                cell.innerHTML = displayPcb.PC.toString(16).toUpperCase();
                // IR
                cell = row.insertCell();
                cell.innerHTML = displayPcb.IR.toString();
                // Acc
                cell = row.insertCell();
                cell.innerHTML = displayPcb.acc.toString(16).toUpperCase();
                // Xreg
                cell = row.insertCell();
                cell.innerHTML = displayPcb.xReg.toString(16).toUpperCase();
                // Yreg
                cell = row.insertCell();
                cell.innerHTML = displayPcb.yReg.toString(16).toUpperCase();
                // Zflag
                cell = row.insertCell();
                cell.innerHTML = displayPcb.zFlag.toString(16).toUpperCase();
                // State
                cell = row.insertCell();
                cell.innerHTML = displayPcb.state;
                // Priority
                cell = row.insertCell();
                cell.innerHTML = displayPcb.priority.toString();
            }
        }

        // Initialize memory display
        public static initMemoryDisplay(): void {
            let table = (<HTMLTableElement>document.getElementById('tableMemory'));
            // Delete the initial dash placeholders
            table.deleteRow(0);
            // We assume each row will hold 8 memory values
            for (let i = 0; i < _Memory.memoryArray.length/8; i++) {
                let row = table.insertRow(i);
                let memoryAddressCell = row.insertCell(0);
                let address = i * 8;
                // Display address in proper memory hex notation and add leading 0s if necessary
                let displayAddress = "0x";
                for (let k = 0; k < 3 - address.toString(16).length; k++) {
                    displayAddress += "0";
                }
                displayAddress += address.toString(16).toUpperCase();
                memoryAddressCell.innerHTML = displayAddress;
                // Fill all the cells with 00s
                for (let j = 1; j < 9; j++){
                    let cell = row.insertCell(j);
                    cell.innerHTML = "00";
                    cell.classList.add("memoryCell");
                }
            }
        }

        // BSOD effect
        public static melonDrop(): void {
            // Initialize Canvas and melon variables
            let ctx;
            let noOfMelons = 20;
            let melons = [];
            let melon;
            let melonImage = document.getElementById("melonFall");

            // Set the context
            ctx = _Canvas.getContext('2d');
            // Change the background to blue for BSOD
            _Canvas.style.backgroundColor = "blue";
            // Change the canvas height
            _Canvas.height = 500;
            // Create the array of melons
            for (let i = 0; i < noOfMelons; i++) {
                melons.push({
                    x: Math.random() * _Canvas.width,
                    y: Math.random() * _Canvas.height,
                    ys: Math.random() + 2,
                    image: melonImage
                });
            }
            
            // Draw the melon on the canvas using the melonImage
            function draw() {
                // Clear the canvas first
                ctx.clearRect(0, 0, _Canvas.width, _Canvas.height);
                // Draw the melons
                for(let i = 0; i < noOfMelons; i++) {
                    melon = melons[i];
                    ctx.drawImage(melon.image, melon.x, melon.y);
                }
                // Call the move function to redraw the images to make them seem in motion
                move();
            }
            
            // Move will continuously change the y coordinates to make them seem in motion
            function move() {
                // Loop through all of the melons
                for (let i = 0; i < noOfMelons; i++) {
                    melon = melons[i];
                    // Change the y coordinate to make them "fall"
                    melon.y += melon.ys;
                    // If melons go past the canvas height, redraw them at the top
                    if (melon.y > _Canvas.height) {
                        melon.x = Math.random() * _Canvas.width;
                        melon.y = -1 * 15;
                    }
                }
            }
            // Set the interval in which to draw the melons
            setInterval(draw, 30);
        }

        // This will update the disk display with contents of session storage
        public static hostDisk(): void {
            let table = (<HTMLTableElement>document.getElementById('tableDisk'));
            let rowNum = 1;
            // For each row, insert the TSB, available bit, pointer, and data into separate cells
            for (let trackNum = 0; trackNum < _Disk.totalTracks; trackNum++) {
                for (let sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (let blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        // generate proper tsb id since firefox sucks and doesn't keep session storage ordered
                        let tsbID = trackNum + ":" + sectorNum + ":" + blockNum;
                        let row = table.insertRow(rowNum);
                        rowNum++;
                        let tsb = row.insertCell(0);
                        tsb.innerHTML = tsbID;
                        let availableBit = row.insertCell(1);
                        availableBit.innerHTML = JSON.parse(sessionStorage.getItem(tsbID)).availableBit;
                        let pointer = row.insertCell(2);
                        let pointerVal = JSON.parse(sessionStorage.getItem(tsbID)).pointer;
                        pointer.innerHTML = pointerVal;
                        let data = row.insertCell(3);
                        data.innerHTML = JSON.parse(sessionStorage.getItem(tsbID)).data.join("").toString();
                    }
                }
            }
        }

        // Initialize HDD display
        public static initDiskDisplay(): void {
            this.hostDisk();
        }
    }
}
