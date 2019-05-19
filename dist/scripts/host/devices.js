///<reference path="../globals.ts" />
/* ------------
     Devices.ts

     Requires global.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they
     represent the hardware. In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak)
     for which we write code that hosts our client OS. This code references page numbers
     in the text book: Operating System Concepts 8th edition by Silberschatz, Galvin,
     and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    var Devices = /** @class */ (function () {
        function Devices() {
            _hardwareClockID = -1;
        }
        /**
         * Hardware/Host Clock Pulse
         */
        Devices.hostClockPulse = function () {
            // Increment the hardware (host) clock.
            _OSclock++;
            // Call the kernel clock pulse event handler.
            _Kernel.krnOnCPUClockPulse();
        };
        /**
         * Enable Keyboard Interrupt, a HARDWARE Interrupt Request.
         * (See pages 560-561 in our text book.)
         */
        Devices.hostEnableKeyboardInterrupt = function () {
            // Listen for key press (keydown, actually) events in the Document
            // and call the simulation processor, which will in turn call the
            // OS interrupt handler.
            document.addEventListener("keydown", Devices.hostOnKeypress, false);
        };
        /**
         * Disable Keyboard Interrupt, a HARDWARE Interrupt Request.
         * (See pages 560-561 in our text book.)
         */
        Devices.hostDisableKeyboardInterrupt = function () {
            document.removeEventListener("keydown", Devices.hostOnKeypress, false);
        };
        /**
         * The canvas element CAN receive focus if you give it a tab index, which we have.
         * Check that we are processing keystrokes only from the canvas's id (as set in index.html).
         * @param event
         */
        Devices.hostOnKeypress = function (event) {
            if (event.target.id === "display") {
                event.preventDefault();
                // Note the pressed key code in the params (Mozilla-specific).
                var params = new Array(event.which, event.shiftKey);
                // Enqueue this interrupt on the kernel interrupt queue so that it 
                // gets to the Interrupt handler.
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KEYBOARD_IRQ, params));
            }
        };
        return Devices;
    }());
    TSOS.Devices = Devices;
})(TSOS || (TSOS = {}));
