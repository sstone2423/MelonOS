/* ------------
   Globals.ts

   Global CONSTANTS and _letiables.
   (Global over both the OS and Hardware Simulation / Host.)
   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
var APP_NAME = "TSOS"; // 'cause Bob and I were at a loss for a better name.
var APP_VERSION = "0.07"; // What did you expect?
// CPU Constants
var CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
var TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. 
// Don't confuse these.
var KEYBOARD_IRQ = 1;
var PROCESS_EXIT_IRQ = 2;
var CONSOLE_WRITE_IRQ = 3;
var INVALID_OP_IRQ = 4;
var BOUNDS_ERROR_IRQ = 5;
var CONTEXT_SWITCH_IRQ = 6;
// Memory Constants
var TOTAL_MEMORY_SIZE = 768; // 786 bytes, 3 segments of 256 bytes
var PARTITION_SIZE = 256;
// Disk Constants
var FILENAME_EXISTS = 0;
var FILENAME_DOESNT_EXIST = 3;
var SUCCESS = 1;
var DISK_IS_FULL = 2;
var QUICK_FORMAT = 0;
var FULL_FORMAT = 1;
var DATA_SIZE = 60;
var SWAP = "$SWAP";
// Global variables
var _CPU; // Utilize TypeScript's type annotation system to ensure that 
// _CPU is an instance of the Cpu class.
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
var _Disk;
var _DiskDriver;
var _Swapper;
var OS = "OS";
// Memory related global variables
var _Memory;
var _MemoryManager;
// Process related global variables
var _PCB;
var _ProcessCount = 0;
var _PCBList = [];
var _Scheduler;
var RR = "rr";
var FCFS = "fcfs";
var PRIORITY = "priority";
// Canvas and font variables
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
// The OS Kernel and its queues.
var _Trace = true; // Default the OS trace to be on.
var _Kernel;
var _KernelInterruptQueue;
var _KernelInputQueue;
var _KernelBuffers;
var _SingleStep = false; // Check if Single-step is enabled
var _NextStep = false; // Check if NextStep is enabled
// Standard input and output
var _StdIn;
var _StdOut;
// UI
var _Console;
var _OsShell;
var _Control;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver;
var _hardwareClockID;
// For testing (and enrichment)...
var Glados; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS; // If the above is linked in, this is the instantiated instance of Glados.
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
