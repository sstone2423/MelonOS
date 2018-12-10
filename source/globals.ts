/* ------------
   Globals.ts

   Global CONSTANTS and _letiables.
   (Global over both the OS and Hardware Simulation / Host.)
   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)

const APP_NAME: string    = "TSOS";   // 'cause Bob and I were at a loss for a better name.
const APP_VERSION: string = "0.07";   // What did you expect?
const CPU_CLOCK_INTERVAL: number = 100;   // This is in ms (milliseconds) so 1000 = 1 second.
const TIMER_IRQ: number = 0;  // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
                              // NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ: number = 1;
const PROCESS_EXIT_IRQ: number = 2;
const CONSOLE_WRITE_IRQ: number = 3;
const INVALID_OP_IRQ: number = 4;
const BOUNDS_ERROR_IRQ: number = 5;
const CONTEXT_SWITCH_IRQ: number = 6;
const TOTAL_MEMORY_SIZE: number = 768; // 786 bytes, 3 segments of 256 bytes
const PARTITION_SIZE: number = 256;
const FILENAME_EXISTS: number = 0;
const FILENAME_NOT_EXISTS: number = 3;
const SUCCESS: number = 1;
const DISK_IS_FULL: number = 2;

// Global variables

let _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
let _OSclock: number = 0;  // Page 23.
let _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
let _Disk: TSOS.Disk;
let _DiskDriver: TSOS.DeviceDriverDisk;
let _Utils: TSOS.Utils;

// Memory related global variables
let _Memory: TSOS.Memory;
let _MemoryManager: TSOS.MemoryManager;

// Process related global variables
let _PCB: TSOS.ProcessControlBlock;
let _ProcessCount = 0;
let _PCBList = [];
let _Scheduler: TSOS.Scheduler;

// Canvas and font variables
let _Canvas: HTMLCanvasElement;             // Initialized in Control.hostInit().
let _DrawingContext: any;                   // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in
                                            // Control.hostInit() for OCD and logic.
let _DefaultFontFamily: string = "sans";    // Ignored, I think. The was just a place-holder in 2008, but the HTML
                                            // canvas may have use for it.
let _DefaultFontSize: number = 13;
let _FontHeightMargin: number = 4;          // Additional space added to font size when advancing a line.

// The OS Kernel and its queues.
let _Trace: boolean = true;         // Default the OS trace to be on.
let _Kernel: TSOS.Kernel;
let _KernelInterruptQueue;
let _KernelInputQueue: any = null;
let _KernelBuffers: any[] = null;
let _SingleStep: boolean = false;   // Check if Single-step is enabled
let _NextStep: boolean = false;     // Check if NextStep is enabled

// Standard input and output
let _StdIn;
let _StdOut;

// UI
let _Console: TSOS.Console;
let _OsShell: TSOS.Shell;
let _Control: TSOS.Control;

// At least this OS is not trying to kill you. (Yet.)
let _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
let _krnKeyboardDriver;
let _hardwareClockID: number = null;

// For testing (and enrichment)...
let Glados: any = null;  // This is the function Glados() in glados.js on Labouseur.com.
let _GLaDOS: any = null; // If the above is linked in, this is the instantiated instance of Glados.

let onDocumentLoad = () => {
    TSOS.Control.hostInit();
};
