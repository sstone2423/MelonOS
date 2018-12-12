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
var TSOS;
(function (TSOS) {
    var Control = /** @class */ (function () {
        function Control() {
        }
        Control.hostInit = function () {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById("display");
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext);
            // Clear the log text box. Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS letiable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };
        Control.hostLog = function (msg, source) {
            if (source === void 0) { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now
                + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
        };
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnSingleStep").disabled = false;
            document.getElementById("btnSingleStep").style.backgroundColor = "red";
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(); // Note: We could simulate multi-core systems by instantiating more than
            // one instance of the CPU here.
            _CPU.init();
            // Initialize memory
            _Memory = new TSOS.Memory();
            _Memory.init();
            this.initMemoryDisplay();
            // Initialize the Disk
            _Disk = new TSOS.Disk();
            _Disk.init();
            this.initDiskDisplay();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        };
        Control.hostBtnHaltOS_click = function (btn) {
            this.hostLog("Emergency halt", "host");
            this.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };
        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };
        Control.hostBtnSingleStep_click = function (btn) {
            if (!_SingleStep) {
                // Enable the NextStep button
                document.getElementById("btnNextStep").disabled = false;
                _SingleStep = true;
                document.getElementById("btnSingleStep").style.backgroundColor = "green";
            }
            else {
                // Disable the NextStep button
                document.getElementById("btnNextStep").disabled = true;
                _SingleStep = false;
                document.getElementById("btnSingleStep").style.backgroundColor = "red";
            }
        };
        Control.hostBtnNextStep_click = function (btn) {
            // Set _NextStep = true
            _NextStep = true;
        };
        Control.hostDisableNextStep = function () {
            // Disable the NextStep button
            document.getElementById("btnNextStep").disabled = true;
            _NextStep = false;
        };
        // Update the CPU display table
        Control.hostCPU = function () {
            var table = document.getElementById('tableCPU');
            table.deleteRow(-1);
            var row = table.insertRow(-1); // New row appended to table
            // PC
            var cell = row.insertCell();
            cell.innerHTML = _CPU.PC.toString(16).toUpperCase();
            // IR
            cell = row.insertCell();
            if (_CPU.isExecuting) {
                cell.innerHTML = _Memory.memoryArray[_CPU.PC].toString();
            }
            else {
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
        };
        // Update the Memory table
        Control.hostMemory = function () {
            var table = document.getElementById('tableMemory');
            var memoryPC = 0;
            for (var i = 0; i < table.rows.length; i++) {
                for (var j = 1; j < 9; j++) {
                    table.rows[i].cells.item(j).innerHTML = _Memory.memoryArray[memoryPC].toString().toUpperCase();
                    // Check to see if the hex needs a leading zero. Covert to decimal, then to hex, then add leading zero
                    var convert = parseInt(_Memory.memoryArray[memoryPC].toString(), 16);
                    if (convert < 16 && convert > 0) {
                        table.rows[i].cells.item(j).innerHTML = "0" + convert.toString(16).toUpperCase();
                    }
                    memoryPC++;
                }
            }
        };
        // Update the resident queue table
        Control.hostProcesses = function () {
            var table = document.getElementById('tableProcesses');
            // Initialize an array of PCBs
            var displayQueue = [];
            // For each PCB in resident queue, print out a new row for it
            for (var i = 0; i < _MemoryManager.residentQueue.getSize(); i++) {
                var pcb = _MemoryManager.residentQueue.dequeue();
                _MemoryManager.residentQueue.enqueue(pcb);
                displayQueue.push(pcb);
            }
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            // Display all the other PCBs sitting in the Resident queue
            // Convert numbers to hex
            while (displayQueue.length > 0) {
                var displayPcb = displayQueue.shift();
                var row = table.insertRow(-1); // New row appended to table
                // PID
                var cell = row.insertCell();
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
                cell.innerHTML = displayPcb.priority;
            }
        };
        // Update the ready queue table
        Control.hostReady = function () {
            var table = document.getElementById('tableReady');
            // Initialize an array of PCBs
            var displayQueue = [];
            // For each PCB in ready queue, print out a new row for it
            for (var i = 0; i < _MemoryManager.readyQueue.getSize(); i++) {
                var pcb = _MemoryManager.readyQueue.dequeue();
                _MemoryManager.readyQueue.enqueue(pcb);
                displayQueue.push(pcb);
            }
            if (_MemoryManager.runningProcess != null) {
                displayQueue.push(_MemoryManager.runningProcess);
            }
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            // Display all the other PCBs sitting in the Resident queue
            // Convert numbers to hex
            while (displayQueue.length > 0) {
                var displayPcb = displayQueue.shift();
                var row = table.insertRow(-1); // New row appended to table
                // PID
                var cell = row.insertCell();
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
                cell.innerHTML = displayPcb.priority;
            }
        };
        // Initialize memory display
        Control.initMemoryDisplay = function () {
            var table = document.getElementById('tableMemory');
            // We assume each row will hold 8 memory values
            for (var i = 0; i < _Memory.memoryArray.length / 8; i++) {
                var row = table.insertRow(i);
                var memoryAddressCell = row.insertCell(0);
                var address = i * 8;
                // Display address in proper memory hex notation
                // Adds leading 0s if necessary
                var displayAddress = "0x";
                for (var k = 0; k < 3 - address.toString(16).length; k++) {
                    displayAddress += "0";
                }
                displayAddress += address.toString(16).toUpperCase();
                memoryAddressCell.innerHTML = displayAddress;
                // Fill all the cells with 00s
                for (var j = 1; j < 9; j++) {
                    var cell = row.insertCell(j);
                    cell.innerHTML = "00";
                    cell.classList.add("memoryCell");
                }
            }
        };
        // BSOD effect
        Control.melonDrop = function () {
            // Initialize Canvas and melon variables
            var ctx;
            var noOfMelons = 20;
            var melons = [];
            var melon;
            var melonImage = document.getElementById("melonFall");
            // Set the context
            ctx = _Canvas.getContext('2d');
            // Change the background to blue for BSOD
            _Canvas.style.backgroundColor = "blue";
            // Change the canvas height
            _Canvas.height = 500;
            // Create the array of melons
            for (var i = 0; i < noOfMelons; i++) {
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
                for (var i_1 = 0; i_1 < noOfMelons; i_1++) {
                    melon = melons[i_1];
                    ctx.drawImage(melon.image, melon.x, melon.y);
                }
                // Call the move function to redraw the images to make them seem in motion
                move();
            }
            // Move will continuously change the y coordinates to make them seem in motion
            function move() {
                // Loop through all of the melons
                for (var i_2 = 0; i_2 < noOfMelons; i_2++) {
                    melon = melons[i_2];
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
        };
        Control.hostTime = function () {
            // TODO: Remove the time zones and DST
            var htmlDateTime = document.getElementById("currentDate");
            var currentDateTime = new Date();
            htmlDateTime.innerHTML = currentDateTime + "";
        };
        // This will update the disk display with contents of session storage
        Control.hostDisk = function () {
            var table = document.getElementById('tableDisk');
            // Remove all rows
            var rows = table.rows.length;
            for (var i = 0; i < rows; i++) {
                table.deleteRow(0);
            }
            var rowNum = 0;
            // firefox sucks and doesn't keep session storage in order
            // For each row, insert the TSB, available bit, pointer, and data into separate cells
            for (var trackNum = 0; trackNum < _Disk.totalTracks; trackNum++) {
                for (var sectorNum = 0; sectorNum < _Disk.totalSectors; sectorNum++) {
                    for (var blockNum = 0; blockNum < _Disk.totalBlocks; blockNum++) {
                        // generate proper tsb id since firefox sucks and doesn't keep session storage ordered
                        var tsbID = trackNum + ":" + sectorNum + ":" + blockNum;
                        var row = table.insertRow(rowNum);
                        rowNum++;
                        row.style.backgroundColor = "white";
                        var tsb = row.insertCell(0);
                        tsb.innerHTML = tsbID;
                        tsb.style.color = "lightcoral";
                        var availableBit = row.insertCell(1);
                        availableBit.innerHTML = JSON.parse(sessionStorage.getItem(tsbID)).availableBit;
                        availableBit.style.color = "lightgreen";
                        var pointer = row.insertCell(2);
                        var pointerVal = JSON.parse(sessionStorage.getItem(tsbID)).pointer;
                        pointer.innerHTML = pointerVal;
                        pointer.style.color = "lightgray";
                        var data = row.insertCell(3);
                        data.innerHTML = JSON.parse(sessionStorage.getItem(tsbID)).data.join("").toString();
                        data.style.color = "lightblue";
                    }
                }
            }
        };
        // Initialize HDD display
        Control.initDiskDisplay = function () {
            this.hostDisk();
        };
        return Control;
    }());
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
