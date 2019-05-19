/* ------------
   Globals.ts

   Global CONSTANTS and _letiables.
   (Global over both the OS and Hardware Simulation / Host.)
   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

const APP_NAME    = "TSOS";   // 'cause Bob and I were at a loss for a better name.
const APP_VERSION = "0.07";   // What did you expect?

// CPU Constants
const CPU_CLOCK_INTERVAL = 100;   // This is in ms (milliseconds) so 1000 = 1 second.
const TIMER_IRQ = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                      // NOTE: The timer is different from hardware/host clock pulses. 
                      // Don't confuse these.
const KEYBOARD_IRQ = 1;
const PROCESS_EXIT_IRQ = 2;
const CONSOLE_WRITE_IRQ = 3;
const INVALID_OP_IRQ = 4;
const BOUNDS_ERROR_IRQ = 5;
const CONTEXT_SWITCH_IRQ = 6;
// Memory Constants
const TOTAL_MEMORY_SIZE = 768; // 786 bytes, 3 segments of 256 bytes
const PARTITION_SIZE = 256;
// Disk Constants
const FILENAME_EXISTS = 0;
const FILENAME_DOESNT_EXIST = 3;
const SUCCESS = 1;
const DISK_IS_FULL = 2;
const QUICK_FORMAT = 0;
const FULL_FORMAT = 1;
const DATA_SIZE = 60;
const SWAP = "$SWAP";

// Global variables
let _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that 
                     // _CPU is an instance of the Cpu class.
let _OSclock = 0;  // Page 23.
let _Mode = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
let _Disk: TSOS.Disk;
let _DiskDriver: TSOS.DeviceDriverDisk;
let _Swapper: TSOS.Swapper;
const OS = "OS";

// Memory related global variables
let _Memory: TSOS.Memory;
let _MemoryManager: TSOS.MemoryManager;

// Process related global variables
let _PCB: TSOS.ProcessControlBlock;
let _ProcessCount = 0;
let _PCBList = [];
let _Scheduler: TSOS.Scheduler;
const RR = "rr";
const FCFS = "fcfs";
const PRIORITY = "priority";

// Canvas and font variables
let _Canvas: HTMLCanvasElement;     // Initialized in Control.hostInit().
let _DrawingContext: any;           // = _Canvas.getContext("2d");  
let _DefaultFontSize = 13;
let _FontHeightMargin = 4;          // Additional space added to font size when advancing a line.

// The OS Kernel and its queues.
let _Trace = true;                  // Default the OS trace to be on.
let _Kernel: TSOS.Kernel;
let _KernelInterruptQueue;
let _KernelInputQueue;
let _KernelBuffers;
let _SingleStep = false;            // Check if Single-step is enabled
let _NextStep = false;              // Check if NextStep is enabled

// Standard input and output
let _StdIn;
let _StdOut;

// UI
let _Console: TSOS.Console;
let _OsShell: TSOS.Shell;
let _Control: TSOS.Control;

// At least this OS is not trying to kill you. (Yet.)
let _SarcasticMode = false;

// Global Device Driver Objects - page 12
let _krnKeyboardDriver;
let _hardwareClockID: number;

// For testing (and enrichment)...
let Glados;  // This is the function Glados() in glados.js on Labouseur.com.
let _GLaDOS; // If the above is linked in, this is the instantiated instance of Glados.

let onDocumentLoad = () => {
    TSOS.Control.hostInit();
};
