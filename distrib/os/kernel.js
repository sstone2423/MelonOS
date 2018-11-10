///<reference path="../globals.ts" />
///<reference path="queue.ts" />
///<reference path="../host/memory.ts" />
///<reference path="scheduler.ts" />
/* ------------
     Kernel.ts

     Routines for the Operating System, NOT the host.
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Kernel = /** @class */ (function () {
        function Kernel() {
            this.timer = 0;
        }
        // OS Startup and Shutdown Routines
        Kernel.prototype.krnBootstrap = function () {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Initialize memory manager
            _MemoryManager = new TSOS.MemoryManager();
            // Initialize the scheduler
            _Scheduler = new TSOS.Scheduler();
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            // Load current date/time
            TSOS.Control.hostTime();
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        };
        Kernel.prototype.krnShutdown = function () {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            // Unload the Device Drivers?
            // More?
            this.krnTrace("end shutdown OS");
        };
        Kernel.prototype.krnOnCPUClockPulse = function () {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // If executing, Increment the timer
            // Check if timer has reached the quantum
            if (this.timer > _Scheduler.quantum && _MemoryManager.readyQueue.getSize() > 0 && _CPU.isExecuting) {
                // Throw the TIMER_IRQ
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(TIMER_IRQ, false));
                // Reset the timer
                this.timer = 0;
            }
            if (_CPU.isExecuting) {
                this.timer++;
            }
            // Update the time
            TSOS.Control.hostTime();
            // Check for an interrtsupt Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is
                // anything being processed.
                // Check if _SingleStep is enabled, then wait for the next step click before executing the next instruction
                if (_SingleStep) {
                    // If user clicked next step, execute one step
                    if (_NextStep) {
                        _CPU.cycle();
                        // Update displays
                        TSOS.Control.hostCPU();
                        TSOS.Control.hostMemory();
                        TSOS.Control.hostProcesses();
                        TSOS.Control.hostReady();
                        _NextStep = false;
                    }
                    this.krnTrace("Idle");
                    // Otherwise, Execute normally
                }
                else {
                    _CPU.cycle();
                    // Update displays
                    TSOS.Control.hostCPU();
                    TSOS.Control.hostMemory();
                    TSOS.Control.hostProcesses();
                    TSOS.Control.hostReady();
                }
            }
            else { // If there are no interrupts and there is nothing being executed
                // then just be idle.
                _NextStep = false; // Revert the boolean when the CPU is finished executing
                this.krnTrace("Idle");
                // Check the ready queue on each cycle if CPU is not executing
                _MemoryManager.checkReadyQueue();
                // Update displays
                TSOS.Control.hostCPU();
                TSOS.Control.hostMemory();
                TSOS.Control.hostProcesses();
                TSOS.Control.hostReady();
            }
        };
        // Interrupt Handling
        Kernel.prototype.krnEnableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnDisableInterrupts = function () {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        };
        Kernel.prototype.krnInterruptHandler = function (irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    _StdOut.putText("Time's up!");
                    _StdOut.advanceLine();
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case PROCESS_EXIT_IRQ:
                    _MemoryManager.exitProcess();
                    // Update the CPU and Processes display
                    TSOS.Control.hostProcesses();
                    TSOS.Control.hostCPU();
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case CONSOLE_WRITE_IRQ:
                    _StdOut.putText(params.toString());
                    break;
                case INVALID_OP_IRQ:
                    _StdOut.putText("Invalid op code in process " + _MemoryManager.runningProcess.pId + ". Exiting the process.");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case BOUNDS_ERROR_IRQ:
                    _StdOut.putText("Out of bounds error in process " + _MemoryManager.runningProcess.pId + ". Exiting the process.");
                    _StdOut.advanceLine();
                    _OsShell.putPrompt();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        };
        Kernel.prototype.krnTimerISR = function () {
            /* The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from
            a device driver).
            Check multiprogramming parameters and enforce quanta here. Call the scheduler / context
            switch here if necessary. */
            _Scheduler.contextSwitch();
        };
        /* System Calls... that generate software interrupts via tha Application Programming Interface library routines.

         Some ideas:
         - ReadConsole
         - WriteConsole
         - CreateProcess
         - ExitProcess
         - WaitForProcessToExit
         - CreateFile
         - OpenFile
         - ReadFile
         - WriteFile
         - CloseFile

        // OS Utility Routines */
        Kernel.prototype.krnTrace = function (msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 === 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        };
        Kernel.prototype.krnTrapError = function (msg) {
            // Display error
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // Shutdown the kernel
            this.krnShutdown();
            // Issue melon drop
            TSOS.Control.melonDrop();
        };
        return Kernel;
    }());
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
