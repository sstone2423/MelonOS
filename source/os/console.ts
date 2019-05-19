///<reference path="../globals.ts" />
/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" 
     (CLI) or interpreter for this console.
     ------------ */

module TSOS {
    export class Console {
        currentFontSize: number;
        currentXPosition: number;
        currentYPosition: number;
        buffer: string;
        constructor(currentFontSize: number = _DefaultFontSize,
                    currentXPosition = 0,
                    currentYPosition: number = _DefaultFontSize,
                    buffer = "") {
                        this.currentFontSize = currentFontSize;
                        this.currentXPosition = currentXPosition;
                        this.currentYPosition = currentYPosition;
                        this.buffer = buffer;
        }

        /**
         * Clear the canvas and reset x, y to 0
         */
        init(): void {
            this.clearScreen();
            this.resetXY();
        }

        /**
         * Handle keyboard inputs
         */
        handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                const chr: string = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal"
                if (chr === String.fromCharCode(CharCode.Enter)) { //     Enter key
                    // The enter key marks the end of a console command, so tell the shell
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                } else {
                    // This is a "normal" character, so draw it on the screen
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        /**
         * Draw text on canvas
         * @param text 
         */
        putText(text: string): void {
            // TODO: Make distinct cases for Char and String
            if (text !== "") {
                for (let i = 0; i < text.length; i++) {
                    // If the x position reaches 510, advance the line and continue drawing
                    if (this.currentXPosition > 510) {
                        _StdOut.advanceLine();
                        // Advance the position so that it is easier to see that you are
                        // still working within the same command line number
                        this.currentXPosition = 15;
                    }
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFontSize, this.currentXPosition,
                                             this.currentYPosition, text[i]);
                    // Move the current X position.
                    const offset = _DrawingContext.measureText(this.currentFontSize, text[i]);
                    this.currentXPosition = this.currentXPosition + offset;
                }
            }
         }

        /**
         * Advance the x and y position to the next line
         */
        advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFontSize)
                     + _FontHeightMargin;
        }

        /**
         * Delete the previous character when backspace is pressed
         * @param character the previous character
         */
        backspaceClear(character: string): void {
            // Find the width of the previous character
            const offset = _DrawingContext.measureText(this.currentFontSize, character);
            // Change the currentXPosition
            this.currentXPosition = this.currentXPosition - offset;
            // Clear the previous character's space
            _DrawingContext.clearRect(this.currentXPosition, (this.currentYPosition - 12), 20, 20);
        }

        /**
         * Clear the canvas
         */
        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        /**
         * Reset the x, y coordinates on the canvas
         */
        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
    }
 }
