///<reference path="../globals.ts" />
///<reference path="../os/interrupt.ts" />
/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside
     a browser is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     This code references page numbers in the text book: Operating System Concepts 8th edition
     by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Cpu = /** @class */ (function () {
        function Cpu() {
        }
        Cpu.prototype.init = function () {
            this.pc = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.isExecuting = false;
        };
        /**
         * Cycles through one opcode and executes it
         * TODO: Accumulate CPU usage and profiling statistics here.
         */
        Cpu.prototype.cycle = function () {
            // Check if the current opcode/pc is out of memory bounds based on partition base/limit
            if (!_MemoryManager.inBounds(this.pc)) {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(BOUNDS_ERROR_IRQ, 0));
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_EXIT_IRQ, false));
            }
            else {
                if (this.isExecuting) {
                    // Initialize variables
                    var hexString = void 0;
                    var fullHexString = void 0;
                    var address = void 0;
                    var value = void 0;
                    // Get the next opCode
                    var opCode = _Memory.readMemory(this.pc);
                    // Update console log with current execution
                    _Kernel.krnTrace('CPU cycle: executing: ' + opCode);
                    switch (opCode) {
                        case "A9" /* LoadAccWithConst */: // Load the accumulator with a constant
                            // Change the value to hex
                            this.acc = parseInt(_Memory.readMemory(this.pc + 1), 16);
                            // Increment the PC
                            this.pc += 2;
                            break;
                        case "AD" /* LoadAccFromMem */: /* Load the accumulator from memory
                            Get the hex memory address by looking at next 2 values in memory
                            and swapping because of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Store in accumulator
                            this.acc = parseInt(_Memory.readMemory(address), 16);
                            this.pc += 3;
                            break;
                        case "8D" /* StoreAccInMem */: /* Store the accumulator in memory
                            Get the hex memory address by looking at next 2 values in memory
                            and swapping because of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Convert the ACC to hex
                            value = this.acc.toString(16);
                            // Write to memory
                            _Memory.writeMemory(address, value);
                            this.pc += 3;
                            break;
                        case "6D" /* AddWithCarry */: /* Add with carry: Adds contents of
                            an address to the contents of the accumulator and keeps
                            the result in the accumulator. Get the hex memory address
                            by looking at next 2 values in memoryand swapping because
                            of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Get the value stored at address of memory
                            value = _Memory.readMemory(address);
                            // Add the value to the accumulator
                            this.acc += parseInt(value, 16);
                            this.pc += 3;
                            break;
                        case "A2" /* LoadXWithConst */: // Load the X register with a constant
                            // Change the value to hex
                            this.xReg = parseInt(_Memory.readMemory(this.pc + 1), 16);
                            this.pc += 2;
                            break;
                        case "AE" /* LoadXFromMem */: /* Load the X register from memory
                            Get the hex memory address by looking at next 2 values in memory
                            and swapping because of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Store in x register
                            this.xReg = parseInt(_Memory.readMemory(address), 16);
                            this.pc += 3;
                            break;
                        case "A0" /* LoadYWithConst */: // Load the Y register with a constant
                            // Change the value to hex
                            this.yReg = parseInt(_Memory.readMemory(this.pc + 1), 16);
                            this.pc += 2;
                            break;
                        case "AC" /* LoadYFromMem */: /* Load the Y register from memory
                            Get the hex memory address by looking at next 2 values in memory
                            and swapping because of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Store in y register
                            this.yReg = parseInt(_Memory.readMemory(address), 16);
                            this.pc += 3;
                            break;
                        case "EA" /* NoOp */: // No operation.. Just increment
                            this.pc++;
                            break;
                        case "00" /* Break */: // Break (system call)
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_EXIT_IRQ, true));
                            break;
                        case "EC" /* CompareMemToX */: /* Compare a byte in memory to the X reg:
                            Sets the Z (zero) flag if equal
                            Get the hex memory address by looking at next 2 values in memory
                            and swapping because of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Get the byte from memory
                            var byte = _Memory.readMemory(address);
                            // Compare the decimal value of byte to Xreg. If true, 
                            // set to 1. Else, set to 0
                            if (parseInt(byte.toString(), 16) == this.xReg) {
                                this.zFlag = 1;
                            }
                            else {
                                this.zFlag = 0;
                            }
                            this.pc += 3;
                            break;
                        case "D0" /* BranchNBytes */: // Branch n bytes if Z flag = 0
                            if (this.zFlag == 0) {
                                // Get the number of bytes to branch
                                var branch = parseInt(_Memory.readMemory(this.pc + 1), 16);
                                this.pc = _Memory.branchLoop(this.pc, branch, _MemoryManager.runningProcess.partition);
                            }
                            else {
                                this.pc += 2;
                            }
                            break;
                        case "EE" /* Increment */: /* Increment the value of a byte
                            Get the hex memory address by looking at next 2 values in memory
                            and swapping because of little-endian */
                            hexString = _Memory.readMemory(this.pc + 1);
                            fullHexString = _Memory.readMemory(this.pc + 2) + hexString;
                            // Convert the 2 back to decimal
                            address = parseInt(fullHexString, 16);
                            // Convert the byte to decimal
                            var byteValue = parseInt(_Memory.readMemory(address), 16);
                            byteValue++;
                            // Convert back to hex
                            var hexByteValue = byteValue.toString(16);
                            // Write the variable back to memory
                            _Memory.writeMemory(address, hexByteValue);
                            this.pc += 3;
                            break;
                        case "FF" /* SysCall */: /* System call
                                #$01 in X reg = print the integer stored in the Y register
                                #$02 in X reg = print the 00-terminated string stored at the address
                                    in the Y register */
                            if (this.xReg === 1) {
                                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONSOLE_WRITE_IRQ, this.yReg));
                            }
                            else if (this.xReg === 2) {
                                address = this.yReg;
                                // Initialize variables for while loop
                                var printString = "";
                                // Get the value of the memory address
                                var original = _Memory.readMemory(address);
                                // Convert decimal to hex
                                var hex = parseInt(original.toString(), 16);
                                // Get the character from the value
                                var chr = String.fromCharCode(hex);
                                while (original != "00") {
                                    var ascii = _Memory.readMemory(address);
                                    // Convert hex to decimal
                                    var dec = parseInt(ascii.toString(), 16);
                                    chr = String.fromCharCode(dec);
                                    printString += chr;
                                    address++;
                                    original = _Memory.readMemory(address);
                                }
                                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONSOLE_WRITE_IRQ, printString));
                            }
                            this.pc++;
                            break;
                        // If opCode is invalid, exit process
                        default:
                            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROCESS_EXIT_IRQ, false));
                    }
                }
                else {
                    _Kernel.krnTrace("CPU cycle");
                }
            }
        };
        return Cpu;
    }());
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
