///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts
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

        // Instantiate a isScrollingCommands boolean variable
        public isScrollingCommands = false;
        public scrollingCommandIndex = 0;

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
                // Determine the character we want to display. Assume its lowercase
                chr = String.fromCharCode(keyCode + 32);
                // then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
                this.characterArray.push(chr);
            } else if (((keyCode >= 48) && (keyCode <= 57) && !isShifted) || // digits
                        (keyCode === 32)                                  || // space
                        (keyCode === 13)                                  || // enter
                        ((keyCode === 59) && !isShifted)) {                  // ;
                if (keyCode === 13) {
                    this.isScrollingCommands = false;
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
            } else if ((keyCode === 219)                    ||  // [
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
                      (keyCode === 189)                     ||  // -
                      (keyCode === 191)) {                      // /
                this.basicKeyPress((keyCode - 144));
            } else if (keyCode === 187) {                       // =
                this.basicKeyPress((keyCode - 126));
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
            } else if (keyCode === 9) {           // tab
                if (_Console.buffer.length != 0) {
                    // Instantiate the tabIndex and match boolean
                    let tabIndex = 0;
                    let match = false;
                    
                    // Find first match
                    while (!match) {
                        // If the substring of a command == to the buffer, grab it
                        if (_OsShell.commandList[tabIndex].command.substring(0, _Console.buffer.length).toLowerCase()
                            == _Console.buffer.toLowerCase()) {
                            // Remove the current characters
                            _StdOut.backspaceClear(_Console.buffer);
                            // Reset the buffer
                            _Console.buffer = "";
                            // Add the command to the queue
                            chr = _OsShell.commandList[tabIndex].command;
                            _KernelInputQueue.enqueue(chr);
                            // Set the boolean to true to escape the loop
                            match = true;
                        // If the entire list has been searched, escape the loop
                        } else if (tabIndex == _OsShell.commandList.length) {
                            match = true;
                        // Otherwise, add 1 to the index and continue the search
                        } else {
                            tabIndex++;
                        }
                    }
                }
            } else if (keyCode === 38) {            // up arrow
                // Check to see if user is already scrolling commands
                if (!this.isScrollingCommands) {
                    // If not, set the commandIndex of the commandsUsedList
                    this.scrollingCommandIndex = _OsShell.commandsUsedList.length - 1;
                    // Change chr to the indexed command
                    chr = _OsShell.commandsUsedList[this.scrollingCommandIndex];
                    // Then queue the indexed command
                    _KernelInputQueue.enqueue(chr);
                    // Set the isScrollingCommands to true for the purpose of the enter key
                    // and to further scroll the commandList
                    this.isScrollingCommands = true;
                // Check to see if user is already scrolling
                } else if (this.isScrollingCommands) {
                    // If so, check to see if the index is already at 0 (the end of the list)
                    if (this.scrollingCommandIndex != 0) {
                        // If not, subtract 1 from the index
                        this.scrollingCommandIndex--;
                    } else {
                        // If so, reset the index to continue scrolling
                        this.scrollingCommandIndex = _OsShell.commandsUsedList.length - 1;
                    }
                    // Reset the buffer because we're not using the previous command anymore
                    _Console.buffer = "";
                    // Reset the x position to the prompt
                    _Console.currentXPosition = 13;
                    // Clear that shit out of here
                    _DrawingContext.clearRect(_Console.currentXPosition, (_Console.currentYPosition - 12), 100, 100);

                    // Then, add the next command to the queue
                    chr = _OsShell.commandsUsedList[this.scrollingCommandIndex];
                    _KernelInputQueue.enqueue(chr);
                }
            } else if (keyCode === 40) {          // down arrow
                // Check to see if user is already scrolling
                if (this.isScrollingCommands) {
                    // If so, check to see if the index is already at the end of the list 
                    if (this.scrollingCommandIndex != _OsShell.commandsUsedList.length - 1) {
                        // If not, add 1 to the index
                        this.scrollingCommandIndex++;
                        // Reset the buffer because we're not using the previous command anymore
                        _Console.buffer = "";
                        // Reset the x position to the prompt
                        _Console.currentXPosition = 13;
                        // Clear that shit out of here
                        _DrawingContext.clearRect(_Console.currentXPosition, (_Console.currentYPosition - 12), 100, 100);
                        // Then, add the next command to the queue
                        chr = _OsShell.commandsUsedList[this.scrollingCommandIndex];
                        _KernelInputQueue.enqueue(chr);
                    } else {
                        _Console.buffer = "";
                        // Reset the x position to the prompt
                        _Console.currentXPosition = 13;
                        // Clear that shit out of here
                        _DrawingContext.clearRect(_Console.currentXPosition, (_Console.currentYPosition - 12), 100, 100);
                    }
                }
            }
        }

        // This function gets the character from the keyCode, pushes into the InputQueue,
        // then pushes the character into the characterArray
        public basicKeyPress(keyCode): void {
            let chr = String.fromCharCode(keyCode);
            _KernelInputQueue.enqueue(chr);
            this.characterArray.push(chr);
        }
    }
}
