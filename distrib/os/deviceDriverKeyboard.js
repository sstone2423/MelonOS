///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */
var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    var DeviceDriverKeyboard = /** @class */ (function (_super) {
        __extends(DeviceDriverKeyboard, _super);
        function DeviceDriverKeyboard() {
            // Override the base method pointers.
            var _this = 
            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
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
        DeviceDriverKeyboard.prototype.krnKbdDriverEntry = function () {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        };
        DeviceDriverKeyboard.prototype.krnKbdDispatchKeyPress = function (params) {
            // Parse the params.    TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) || // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) { // a..z {
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
            }
            else if (((keyCode >= 48) && (keyCode <= 57) && !isShifted) || // digits
                (keyCode === 32) || // space
                (keyCode === 13) || // enter
                ((keyCode === 61) && !isShifted) || // =
                ((keyCode === 59) && !isShifted)) { // ;
                if (keyCode === 13) {
                    this.isScrollingCommands = false;
                    chr = String.fromCharCode(keyCode);
                    _KernelInputQueue.enqueue(chr);
                    this.characterArray = [];
                }
                else {
                    this.basicKeyPress(keyCode);
                }
            }
            else if (isShifted && (keyCode === 48)) { // )
                this.basicKeyPress((keyCode - 7));
            }
            else if ((((isShifted && (keyCode === 49)) || // !
                (isShifted && (keyCode === 51)) || // #
                (isShifted && (keyCode === 52)) || // $
                (isShifted && (keyCode === 53))))) { // %        
                this.basicKeyPress((keyCode - 16));
            }
            else if (isShifted && (keyCode === 50)) { // @
                this.basicKeyPress((keyCode + 14));
            }
            else if (isShifted && (keyCode === 54)) { // ^
                this.basicKeyPress((keyCode + 40));
            }
            else if ((isShifted && (keyCode === 55)) || // &
                (isShifted && (keyCode === 57))) { // )
                this.basicKeyPress((keyCode - 17));
            }
            else if (isShifted && (keyCode === 56)) { // *
                this.basicKeyPress((keyCode - 14));
            }
            else if (isShifted && (keyCode === 192)) { // ~
                this.basicKeyPress((keyCode - 66));
            }
            else if ((keyCode === 192) || // `
                (isShifted && (keyCode === 219)) || // {
                (isShifted && (keyCode === 221)) || // }
                (isShifted && (keyCode === 220))) { // |
                this.basicKeyPress((keyCode - 96));
            }
            else if (isShifted && (keyCode === 173)) { // _
                this.basicKeyPress((keyCode - 78));
            }
            else if ((keyCode === 173) || // -
                (keyCode === 219) || // [
                (keyCode === 221) || // ]
                (keyCode === 220) || // \
                (isShifted && (keyCode === 188)) || // <
                (isShifted && (keyCode === 190)) || // >
                (isShifted && (keyCode === 191))) { // ?
                this.basicKeyPress((keyCode - 128));
            }
            else if (isShifted && (keyCode === 61)) { // +
                this.basicKeyPress((keyCode - 18));
            }
            else if (isShifted && (keyCode === 59)) { // :
                this.basicKeyPress((keyCode - 1));
            }
            else if (isShifted && (keyCode === 222)) { // "
                this.basicKeyPress((keyCode - 188));
            }
            else if (keyCode === 222) { // '
                this.basicKeyPress((keyCode - 183));
            }
            else if ((keyCode === 188) || // ,
                (keyCode === 190) || // .
                (keyCode === 191)) { // /
                this.basicKeyPress((keyCode - 144));
            }
            else if (keyCode == 8) { // backspace
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
            else if (keyCode === 9) { // tab
                if (_KernelInputQueue.length > 0) {
                }
            }
            else if (keyCode === 38) { // up arrow
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
            else if (keyCode === 40) { // down arrow
                // Check to see if user is already scrolling
                if (this.isScrollingCommands) {
                    // If so, check to see if the index is already at 0 (the end of the list)
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
                }
            }
        };
        // This function gets the character from the keyCode, pushes into the InputQueue,
        // then pushes the character into the characterArray
        DeviceDriverKeyboard.prototype.basicKeyPress = function (keyCode) {
            var chr = String.fromCharCode(keyCode);
            console.log(chr);
            _KernelInputQueue.enqueue(chr);
            this.characterArray.push(chr);
            console.log(this.characterArray);
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
