///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
/* ----------------------------------
   DeviceDriverKeyboard.ts
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {
    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {
        // Instantiate the characterArray to keep track of all characters being input
        characterArray = [];

        // Instantiate a isScrollingCommands boolean variable
        isScrollingCommands = false;
        scrollingCommandIndex = 0;

        constructor() {
            // Override the base method pointers.
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }
        
        /**
         * Initialization routine for this, the kernel-mode Keyboard Device Driver.
         */
        public krnKbdDriverEntry(): void {
            this.status = "loaded";
            // More?
        }

        /**
         * Parse keypress keyCodes
         * @param params keyCode: number, isShifted: boolean
         */
        public krnKbdDispatchKeyPress(params): void {
            // Parse the params.    
            // TODO: Check that the params are valid and osTrapError if not.
            // TODO: Make this more efficient
            const keyCode: number = params[0];
            const isShifted: boolean = params[1];

            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            let chr: string = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= CharCode.A) && (keyCode <= CharCode.Z)) ||   // A..Z
                ((keyCode >= CharCode.a) && (keyCode <= CharCode.z))) {  // a..z {
                // Determine the character we want to display. Assume its lowercase
                chr = String.fromCharCode(keyCode + 32);
                // then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
                this.characterArray.push(chr);
            } else if (((keyCode >= CharCode.Zero) && (keyCode <= CharCode.Nine) && !isShifted) || // digits
                        (keyCode === CharCode.Space) ||
                        (keyCode === CharCode.Enter)) {
                if (keyCode === CharCode.Enter) {
                    this.isScrollingCommands = false;
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                    this.characterArray = [];
                } else {
                    this.basicKeyPress(keyCode);
                }
            } else if (isShifted && (keyCode === CharCode.Zero)) {        // )
                this.basicKeyPress((keyCode - 7));
            } else if ((((isShifted && (keyCode === CharCode.One))    ||  // !
                      (isShifted && (keyCode === CharCode.Three))     ||  // #
                      (isShifted && (keyCode === CharCode.Four))      ||  // $
                      (isShifted && (keyCode === CharCode.Five))))) {     // %        
                this.basicKeyPress((keyCode - 16));
            } else if (isShifted && (keyCode === CharCode.Two)) {         // @
                this.basicKeyPress((keyCode + 14));
            } else if (isShifted && (keyCode === CharCode.Six)) {         // ^
                this.basicKeyPress((keyCode + 40));
            } else if ((isShifted && (keyCode === CharCode.Seven))    ||  // &
                      (isShifted && (keyCode === CharCode.Nine))) {       // (
                this.basicKeyPress((keyCode - 17));
            } else if (isShifted && (keyCode === CharCode.Eight)) {       // *
                this.basicKeyPress((keyCode - 14));
            } else if (isShifted && (keyCode === CharCode.Backquote)) {   // ~
                this.basicKeyPress((keyCode - 66));
            } else if ((keyCode === CharCode.Backquote)               ||  // `
                      (isShifted && (keyCode === CharCode.LBracket))  ||  // {
                      (isShifted && (keyCode === CharCode.RBracket))  ||  // }
                      (isShifted && (keyCode === CharCode.Backslash))) {  // |
                this.basicKeyPress((keyCode - 96));
            } else if (isShifted && (keyCode === CharCode.Dash)) {        // _
                this.basicKeyPress((keyCode - 94));
            } else if ((keyCode === CharCode.LBracket) || 
                      (keyCode === CharCode.RBracket)  || 
                      (keyCode === CharCode.Backslash) ||
                      (isShifted && (keyCode === CharCode.Comma))     ||  // <
                      (isShifted && (keyCode === CharCode.Period))    ||  // >
                      (isShifted && (keyCode === CharCode.Colon))     ||  // :
                      (isShifted && (keyCode === CharCode.Slash))) {      // ?
                this.basicKeyPress((keyCode - 128));
            } else if (isShifted && (keyCode === CharCode.SingleQuote)) { // "
                this.basicKeyPress((keyCode - 188));
            } else if (keyCode === CharCode.SingleQuote) { 
                this.basicKeyPress((keyCode - 183));
            } else if ((keyCode === CharCode.Comma)  ||
                       (keyCode === CharCode.Dash)   ||
                       (keyCode === CharCode.Period) || 
                       (isShifted && (keyCode === CharCode.Equals)) ||  // +
                       (keyCode === CharCode.Slash)) {
                this.basicKeyPress(keyCode - 144);
            } else if (keyCode === CharCode.Equals) {
                this.basicKeyPress((keyCode - 126));
            } else if (keyCode === CharCode.Colon) {
                this.basicKeyPress((keyCode - 127));
            } else if (keyCode === CharCode.Backspace) { 
                if (this.characterArray.length > 0) {
                    // Initialize the previous character
                    let previousChar = this.characterArray[this.characterArray.length - 1];
                    this.characterArray.pop();
                    // Take the character out of the buffer
                    _StdOut.buffer = _StdOut.buffer.substring(0, (_StdOut.buffer.length - 1));
                    // Clear the area of the last character on canvas
                    _StdOut.backspaceClear(previousChar);
                }
            } else if (keyCode === CharCode.Tab) {
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
            } else if (keyCode === CharCode.Up) {
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
            } else if (keyCode === CharCode.Down) {
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

        /**
         * This function gets the character from the keyCode, pushes into the InputQueue,
         * then pushes the character into the characterArray
         * @param keyCode 
         */
        public basicKeyPress(keyCode: number): void {
            let chr = String.fromCharCode(keyCode);
            _KernelInputQueue.enqueue(chr);
            this.characterArray.push(chr);
        }
    }
}
