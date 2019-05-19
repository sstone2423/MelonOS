///<reference path="../globals.ts" />
///<reference path="device-driver.ts" />
/* ----------------------------------
   DeviceDriverKeyboard.ts
   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            var _this = 
            // Override the base method pointers.
            _super.call(this) || this;
            // Instantiate the characterArray to keep track of all characters being input
            _this.characterArray = [];
            // Instantiate a isScrollingCommands boolean variable
            _this.isScrollingCommands = false;
            _this.scrollingCommandIndex = 0;
            _this.driverEntry = _this.krnKbdDriverEntry;
            _this.isr = _this.krnKbdDispatchKeyPress;
            return _this;
        }
        /**
         * Initialization routine for this, the kernel-mode Keyboard Device Driver.
         */
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            this.status = "loaded";
            // More?
        };
        /**
         * Parse keypress keyCodes
         * @param params keyCode: number, isShifted: boolean
         */
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    
            // TODO: Check that the params are valid and osTrapError if not.
            // TODO: Make this more efficient
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65 /* A */) && (keyCode <= 90 /* Z */)) || // A..Z
                ((keyCode >= 97 /* a */) && (keyCode <= 123 /* z */))) { // a..z {
                // Determine the character we want to display. Assume its lowercase
                chr = String.fromCharCode(keyCode + 32);
                // then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
                this.characterArray.push(chr);
            }
            else if (((keyCode >= 48 /* Zero */) && (keyCode <= 57 /* Nine */) && !isShifted)
                || (keyCode === 32 /* Space */) || (keyCode === 13 /* Enter */)) {
                if (keyCode === 13 /* Enter */) {
                    this.isScrollingCommands = false;
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                    this.characterArray = [];
                }
                else {
                    this.basicKeyPress(keyCode);
                }
            }
            else if (isShifted && (keyCode === 48 /* Zero */)) { // )
                this.basicKeyPress((keyCode - 7));
            }
            else if ((((isShifted && (keyCode === 49 /* One */)) || // !
                (isShifted && (keyCode === 51 /* Three */)) || // #
                (isShifted && (keyCode === 52 /* Four */)) || // $
                (isShifted && (keyCode === 53 /* Five */))))) { // %        
                this.basicKeyPress((keyCode - 16));
            }
            else if (isShifted && (keyCode === 50 /* Two */)) { // @
                this.basicKeyPress((keyCode + 14));
            }
            else if (isShifted && (keyCode === 54 /* Six */)) { // ^
                this.basicKeyPress((keyCode + 40));
            }
            else if ((isShifted && (keyCode === 55 /* Seven */)) || // &
                (isShifted && (keyCode === 57 /* Nine */))) { // (
                this.basicKeyPress((keyCode - 17));
            }
            else if (isShifted && (keyCode === 56 /* Eight */)) { // *
                this.basicKeyPress((keyCode - 14));
            }
            else if (isShifted && (keyCode === 192 /* Backquote */)) { // ~
                this.basicKeyPress((keyCode - 66));
            }
            else if ((keyCode === 192 /* Backquote */) || // `
                (isShifted && (keyCode === 219 /* LBracket */)) || // {
                (isShifted && (keyCode === 221 /* RBracket */)) || // }
                (isShifted && (keyCode === 220 /* Backslash */))) { // |
                this.basicKeyPress((keyCode - 96));
            }
            else if (isShifted && (keyCode === 189 /* Dash */)) { // _
                this.basicKeyPress((keyCode - 94));
            }
            else if ((keyCode === 219 /* LBracket */) ||
                (keyCode === 221 /* RBracket */) ||
                (keyCode === 220 /* Backslash */) ||
                (isShifted && (keyCode === 188 /* Comma */)) || // <
                (isShifted && (keyCode === 190 /* Period */)) || // >
                (isShifted && (keyCode === 186 /* Colon */)) || // :
                (isShifted && (keyCode === 191 /* Slash */))) { // ?
                this.basicKeyPress((keyCode - 128));
            }
            else if (isShifted && (keyCode === 222 /* SingleQuote */)) { // "
                this.basicKeyPress((keyCode - 188));
            }
            else if (keyCode === 222 /* SingleQuote */) {
                this.basicKeyPress((keyCode - 183));
            }
            else if ((keyCode === 188 /* Comma */) ||
                (keyCode === 189 /* Dash */) ||
                (keyCode === 190 /* Period */) ||
                (isShifted && (keyCode === 187 /* Equals */)) || // +
                (keyCode === 191 /* Slash */)) {
                this.basicKeyPress(keyCode - 144);
            }
            else if (keyCode === 187 /* Equals */) {
                this.basicKeyPress((keyCode - 126));
            }
            else if (keyCode === 186 /* Colon */) {
                this.basicKeyPress((keyCode - 127));
            }
            else if (keyCode === 8 /* Backspace */) {
                if (this.characterArray.length > 0) {
                    // Initialize the previous character
                    var previousChar = this.characterArray[this.characterArray.length - 1];
                    this.characterArray.pop();
                    // Take the character out of the buffer
                    _StdOut.buffer = _StdOut.buffer.substring(0, (_StdOut.buffer.length - 1));
                    // Clear the area of the last character on canvas
                    _StdOut.backspaceClear(previousChar);
                }
            }
            else if (keyCode === 9 /* Tab */) {
                if (_Console.buffer.length != 0) {
                    // Instantiate the tabIndex and match boolean
                    var tabIndex = 0;
                    var match = false;
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
                        }
                        else if (tabIndex == _OsShell.commandList.length) {
                            match = true;
                            // Otherwise, add 1 to the index and continue the search
                        }
                        else {
                            tabIndex++;
                        }
                    }
                }
            }
            else if (keyCode === 38 /* Up */) {
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
                }
                else if (this.isScrollingCommands) {
                    // If so, check to see if the index is already at 0 (the end of the list)
                    if (this.scrollingCommandIndex != 0) {
                        // If not, subtract 1 from the index
                        this.scrollingCommandIndex--;
                    }
                    else {
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
            }
            else if (keyCode === 40 /* Down */) {
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
                    }
                    else {
                        _Console.buffer = "";
                        // Reset the x position to the prompt
                        _Console.currentXPosition = 13;
                        // Clear that shit out of here
                        _DrawingContext.clearRect(_Console.currentXPosition, (_Console.currentYPosition - 12), 100, 100);
                    }
                }
            }
        };
        /**
         * This function gets the character from the keyCode, pushes into the InputQueue,
         * then pushes the character into the characterArray
         * @param keyCode
         */
        DeviceDriverKeyboard.prototype.basicKeyPress = function (keyCode) {
            var chr = String.fromCharCode(keyCode);
            _KernelInputQueue.enqueue(chr);
            this.characterArray.push(chr);
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
