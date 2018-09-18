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
            }
            else if (((keyCode >= 48) && (keyCode <= 57) && !isShifted) || // digits
                (keyCode === 32) || // space
                (keyCode === 13) || // enter
                ((keyCode === 61) && !isShifted) || // =
                ((keyCode === 59) && !isShifted)) { // ;
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 48)) { // )
                chr = String.fromCharCode(keyCode - 7);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((((isShifted && (keyCode === 49)) || // !
                (isShifted && (keyCode === 51)) || // #
                (isShifted && (keyCode === 52)) || // $
                (isShifted && (keyCode === 53))))) { // %        
                chr = String.fromCharCode(keyCode - 16);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 50)) { // @
                chr = String.fromCharCode(keyCode + 14);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 54)) { // ^
                chr = String.fromCharCode(keyCode + 40);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((isShifted && (keyCode === 55)) || // &
                (isShifted && (keyCode === 57))) { // )
                chr = String.fromCharCode(keyCode - 17);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 56)) { // *
                chr = String.fromCharCode(keyCode - 14);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 192)) { // ~
                chr = String.fromCharCode(keyCode - 66);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode === 192) || // `
                (isShifted && (keyCode === 219)) || // {
                (isShifted && (keyCode === 221)) || // }
                (isShifted && (keyCode === 220))) { // |
                chr = String.fromCharCode(keyCode - 96);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 173)) { // _
                chr = String.fromCharCode(keyCode - 78);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode === 173) || // -
                (keyCode === 219) || // [
                (keyCode === 221) || // ]
                (keyCode === 220) || // \
                (isShifted && (keyCode === 188)) || // <
                (isShifted && (keyCode === 190)) || // >
                (isShifted && (keyCode === 191))) { // ?
                chr = String.fromCharCode(keyCode - 128);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 61)) { // +
                chr = String.fromCharCode(keyCode - 18);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 59)) { // :
                chr = String.fromCharCode(keyCode - 1);
                _KernelInputQueue.enqueue(chr);
            }
            else if (isShifted && (keyCode === 222)) { // "
                chr = String.fromCharCode(keyCode - 188);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode === 222) { // '
                chr = String.fromCharCode(keyCode - 183);
                _KernelInputQueue.enqueue(chr);
            }
            else if ((keyCode === 188) || // ,
                (keyCode === 190) || // .
                (keyCode === 191)) { // /
                chr = String.fromCharCode(keyCode - 144);
                _KernelInputQueue.enqueue(chr);
            }
            else if (keyCode == 8) { // backspace
                console.log("dequeued");
                // Take the character out of the queue
                _KernelInputQueue.dequeue();
                // Clear the area of the last character on canvas
                _StdOut.backspaceClear();
            }
        };
        return DeviceDriverKeyboard;
    }(TSOS.DeviceDriver));
    TSOS.DeviceDriverKeyboard = DeviceDriverKeyboard;
})(TSOS || (TSOS = {}));
