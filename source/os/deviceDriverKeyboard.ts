///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        
        // Instantiate the characterArray to keep track of all characters being input
        public characterArray = [];

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            const keyCode = params[0];
            const isShifted = params[1];

            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            let chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z {
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
                this.characterArray.push(chr);
                console.log(this.characterArray);
            } else if (((keyCode >= 48) && (keyCode <= 57) && !isShifted) || // digits
                        (keyCode === 32)                                  || // space
                        (keyCode === 13)                                  || // enter
                        ((keyCode === 61) && !isShifted)                  || // =
                        ((keyCode === 59) && !isShifted)) {                  // ;
                if (keyCode === 13) {
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                    this.characterArray = [];
                } else {
                    this.basicKeyPress(keyCode);
                }
            } else if (isShifted && (keyCode === 48)) {         // )
                this.basicKeyPress((keyCode - 7));
            } else if ((((isShifted && (keyCode === 49))    ||  // !
                      (isShifted && (keyCode === 51))       ||  // #
                      (isShifted && (keyCode === 52))       ||  // $
                      (isShifted && (keyCode === 53))))) {      // %        
                this.basicKeyPress((keyCode - 16));
            } else if (isShifted && (keyCode === 50)) {         // @
                this.basicKeyPress((keyCode + 14));
            } else if (isShifted && (keyCode === 54)) {         // ^
                this.basicKeyPress((keyCode + 40));
            } else if ((isShifted && (keyCode === 55))      ||  // &
                      (isShifted && (keyCode === 57))) {        // )
                this.basicKeyPress((keyCode - 17));
            } else if (isShifted && (keyCode === 56)) {         // *
                this.basicKeyPress((keyCode - 14));
            } else if (isShifted && (keyCode === 192)) {        // ~
                this.basicKeyPress((keyCode - 66));
            } else if ((keyCode === 192)                    ||  // `
                      (isShifted && (keyCode === 219))      ||  // {
                      (isShifted && (keyCode === 221))      ||  // }
                      (isShifted && (keyCode === 220))) {       // |
                this.basicKeyPress((keyCode - 96));
            } else if (isShifted && (keyCode === 173)) {        // _
                this.basicKeyPress((keyCode - 78));
            } else if ((keyCode === 173)                    ||  // -
                      (keyCode === 219)                     ||  // [
                      (keyCode === 221)                     ||  // ]
                      (keyCode === 220)                     ||  // \
                      (isShifted && (keyCode === 188))      ||  // <
                      (isShifted && (keyCode === 190))      ||  // >
                      (isShifted && (keyCode === 191))) {       // ?
                this.basicKeyPress((keyCode - 128));
            } else if (isShifted && (keyCode === 61)) {         // +
                this.basicKeyPress((keyCode - 18));
            } else if (isShifted && (keyCode === 59)) {         // :
                this.basicKeyPress((keyCode - 1));
            } else if (isShifted && (keyCode === 222)) {        // "
                this.basicKeyPress((keyCode - 188));
            } else if (keyCode === 222) {                       // '
                this.basicKeyPress((keyCode - 183));
            } else if ((keyCode === 188)                    ||  // ,
                      (keyCode === 190)                     ||  // .
                      (keyCode === 191)) {                      // /
                this.basicKeyPress((keyCode - 144));
            } else if (keyCode == 8) { // backspace
                if (this.characterArray.length > 0) {
                    // Initialize the previous character
                    let previousChar = this.characterArray[this.characterArray.length - 1];
                    this.characterArray.pop();
                    // Take the character out of the buffer
                    _StdOut.buffer = _StdOut.buffer.substring(0, (_StdOut.buffer.length - 1));
                    // Clear the area of the last character on canvas
                    _StdOut.backspaceClear(previousChar);
                }
            } else if (keyCode === 9) {                         // tab
                if (_KernelInputQueue.length > 0 ) {

                }
            } else if (keyCode === 38) {
                chr = _OsShell.commandsUsedList[_OsShell.commandsUsedList.length - 1];
                _KernelInputQueue.enqueue(chr);
                console.log(_OsShell.commandsUsedList);
                console.log(chr);
            }
        }

        // This function gets the character from the keyCode, pushes into the InputQueue,
        // then pushes the character into the characterArray
        public basicKeyPress(keyCode): void {
            let chr = String.fromCharCode(keyCode);
            console.log(chr);
            _KernelInputQueue.enqueue(chr);
            this.characterArray.push(chr);
            console.log(this.characterArray);
        }
    }
}
