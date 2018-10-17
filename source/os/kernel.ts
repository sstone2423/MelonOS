///<reference path="../globals.ts" />
///<reference path="queue.ts" />
///<reference path="../host/memory.ts" />

/* ------------
     Kernel.ts

     Requires globals.ts
              queue.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        // OS Startup and Shutdown Routines

        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.

            // Initialize the console.
            _Console = new Console();          // The command line interface / console I/O device.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            // Load current date/time
            const htmlDateTime = document.getElementById("currentDate");
            const currentDateTime = new Date();
            htmlDateTime.innerHTML = currentDateTime + "";

            // Initialize memory
            _Memory = new Memory();
            _Memory.init();

            // Initialize memory manager
            _MemoryManager = new MemoryManager();

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();

            // Unload the Device Drivers?
            // More?
            this.krnTrace("end shutdown OS");
        }

        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                const interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            } else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is
                                           // anything being processed.
                _CPU.cycle();
            } else {                      // If there are no interrupts and there is nothing being executed
                                          // then just be idle.
                this.krnTrace("Idle");
                // Check the ready queue on each cycle if CPU is not executing
                _MemoryManager.checkReadyQueue();
            }
        }

        // Interrupt Handling

        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);

            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;

                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;

                case PROCESS_EXIT_IRQ:
                    _MemoryManager.exitProcess(params);
                    // TODO: Update display
                    break;

                case CONSOLE_WRITE_IRQ:
                    _StdOut.putText(params);
                    break;

                case INVALID_OP_IRQ:
                    _StdOut.putText("Invalid op code in process " + _MemoryManager.runningProcess.pId + ". Exiting the process.")
                    break;

                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
                    this.melonDrop();
            }
        }

        public krnTimerISR() {
            /* The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from
            a device driver).
            Check multiprogramming parameters and enforce quanta here. Call the scheduler / context
            switch here if necessary. */
        }

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

        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 === 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                } else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            // Display error
            Control.hostLog("OS ERROR - TRAP: " + msg);
        }

        public melonDrop() {
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
            // Shutdown the kernel
            this.krnShutdown();
        }
    }
}
