///<reference path="../globals.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment
          center activities, serious injuries may occur when trying to
          write your own Operating System.
   ------------ */
var TSOS;
(function (TSOS) {
    var Shell = /** @class */ (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.commandsUsedList = [];
        }
        /**
         * Load the command list.
         */
        Shell.prototype.init = function () {
            var sc;
            // v
            sc = new TSOS.ShellCommand(this.shellVer, "v", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // version
            sc = new TSOS.ShellCommand(this.shellVer, "version", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the "
                + "underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;
            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays the current location.");
            this.commandList[this.commandList.length] = sc;
            // melon
            sc = new TSOS.ShellCommand(this.shellMelon, "melon", "- Displays wonderful melon puns for the world to see.");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Changes the status display bar to whatever your heart desires.");
            this.commandList[this.commandList.length] = sc;
            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads and validates the user code in the user input area. Only"
                + " hex digits and spaces are valid.");
            this.commandList[this.commandList.length] = sc;
            // dropit
            sc = new TSOS.ShellCommand(this.shellDropit, "dropit", "- Please don't drop those..");
            this.commandList[this.commandList.length] = sc;
            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- Run the program currently loaded in memory.");
            this.commandList[this.commandList.length] = sc;
            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearmem, "clearmem", "- Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;
            // runall
            sc = new TSOS.ShellCommand(this.shellRunall, "runall", "- Run all programs currently loaded in memory.");
            this.commandList[this.commandList.length] = sc;
            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- Display all processes and their IDs.");
            this.commandList[this.commandList.length] = sc;
            // kill <id>
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- Kills the specified process ID.");
            this.commandList[this.commandList.length] = sc;
            // ls
            sc = new TSOS.ShellCommand(this.shellLs, "ls", "- Lists files currently on disk. ls -l will show hidden files as well.");
            this.commandList[this.commandList.length] = sc;
            // getschedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", "- Returns the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // setschedule rr, fcfs, priority
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<rr, fcfs, priority> - Sets the CPU scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;
            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Initialize all blocks in all sectors in all tracks.");
            this.commandList[this.commandList.length] = sc;
            // delete <filename>
            sc = new TSOS.ShellCommand(this.shellDeleteFile, "delete", "<filename> - Delete the specified file from disk.");
            this.commandList[this.commandList.length] = sc;
            // write <filename> "data"
            sc = new TSOS.ShellCommand(this.shellWriteFile, "write", "<filename> \"data\" - Write data to the specified file on disk.");
            this.commandList[this.commandList.length] = sc;
            // read <filename>
            sc = new TSOS.ShellCommand(this.shellReadFile, "read", "<filename> - Read the specified file from disk.");
            this.commandList[this.commandList.length] = sc;
            // create <filename>
            sc = new TSOS.ShellCommand(this.shellCreateFile, "create", "<filename> - Create a file fon disk.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        /**
         * Outputs the initial prompt >
         */
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
        /**
         * Parses the input buffer, determines the command, and executes it
         * @param buffer is the input buffer string coming from the user
         */
        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            // Parse the input...
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local letiables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            // Determine the command and execute it.
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out
            // and tell me in class.
            var index = 0;
            var found = false;
            var fn;
            // Loop until every command in the commandList has been read
            while (!found && index < this.commandList.length) {
                // First commandList entry
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                    // Save the command in commandsUsedList for a command history
                    this.commandsUsedList.push(this.commandList[index].command);
                    // Second commandList entry
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command.
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        /**
         * Execute the command's function along with any arguments
         * @param fn the command's function
         * @param args optional arguments
         */
        Shell.prototype.execute = function (fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        };
        /**
         * Parses input for arguments
         * @param buffer the input buffer
         */
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = buffer.trim();
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = cmd.trim();
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = tempList[i].trim();
                if (arg !== "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        /**
         * Invalid Command that says horrible things to the user
         */
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, idiot,");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of Jacksonville.");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        /**
         * Displays a curse
         */
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
        /**
         * Displays an apology
         */
        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        };
        /**
         * Displays the version
         */
        Shell.prototype.shellVer = function () {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        /**
         * Displays the descriptions of each command
         */
        Shell.prototype.shellHelp = function () {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        /**
         * Shutsdown the kernel
         */
        Shell.prototype.shellShutdown = function () {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        /**
         * Clears the CLI
         */
        Shell.prototype.shellCls = function () {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        /**
         * Gives instructions and details on each command
         * @param args the command
         */
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("help displays a list of (hopefully) valid commands.");
                        break;
                    case "curse":
                        _StdOut.putText("curse issues all of your derogatory remarks for you!");
                        break;
                    case "apology":
                        _StdOut.putText("apology mends your relationship with MelonOS because it has feelings too.");
                        break;
                    case "ver":
                        _StdOut.putText("ver displays the current version.");
                        break;
                    case "v":
                        _StdOut.putText("v displays the current version.");
                        break;
                    case "version":
                        _StdOut.putText("version displays the current version.");
                        break;
                    case "shutdown":
                        _StdOut.putText("shutdown calls the kernel shutdown routine.");
                        break;
                    case "cls":
                        _StdOut.putText("cls clears the screen for additional melons.");
                        break;
                    case "trace":
                        _StdOut.putText("trace displays the clock intervals.");
                        break;
                    case "rot13":
                        _StdOut.putText("rot13 converts characters in the string to character + 13. It was one of the first ciphers created.");
                        break;
                    case "prompt":
                        _StdOut.putText("prompt changes the initial prompt to the specific string.");
                        break;
                    case "date":
                        _StdOut.putText("date displays the current date.");
                        break;
                    case "whereami":
                        _StdOut.putText("whereami displays the current location.");
                        break;
                    case "melon":
                        _StdOut.putText("melon will give you juicy puns to use with all of your friends!");
                        break;
                    case "status":
                        _StdOut.putText("status changes the status display bar to whatever string your"
                            + " heart desires.");
                        break;
                    case "load":
                        _StdOut.putText("load validates the user input program to ensure only hex digits"
                            + " and spaces exist.");
                        break;
                    case "dropit":
                        _StdOut.putText("dropit can not be undone.. Please don't drop the melons."
                            + " and spaces exist.");
                        break;
                    case "run":
                        _StdOut.putText("run will run the current process loaded in memory.");
                        break;
                    case "clearmem":
                        _StdOut.putText("clearmem will *cough* init *cough* clear all memory partitions.");
                        break;
                    case "runall":
                        _StdOut.putText("runall will execute all programs in memory.");
                        break;
                    case "ps":
                        _StdOut.putText("ps will list all processes and their process IDs.");
                        break;
                    case "kill":
                        _StdOut.putText("kill <id> will terminate the corresponding process");
                        break;
                    case "quantum":
                        _StdOut.putText("quantum <int> will change the round round scheduling time.");
                        break;
                    case "ls":
                        _StdOut.putText("ls lists all non-hidden files on disk. Use ls -l to see hidden files.");
                        break;
                    case "format":
                        _StdOut.putText("format initializes and clears the disk.");
                        break;
                    case "delete":
                        _StdOut.putText("delete <filename> will delete the specified file from disk.");
                        break;
                    case "write":
                        _StdOut.putText("write <filename> \"disk\" will write data to the specified file on disk.");
                        break;
                    case "read":
                        _StdOut.putText("read <filename> will read the specified file on disk.");
                        break;
                    case "create":
                        _StdOut.putText("create <filename> will create the specified file on disk.");
                        break;
                    case "getschedule":
                        _StdOut.putText("getschedule will display the current CPU scheduling algorithm.");
                        break;
                    case "setschedule":
                        _StdOut.putText("setschedule <algorithm> will set the CPU scheduling algorithm to fcfs (First come first serve), rr (Round robin), or priority.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        /**
         * Starts or ends trace mode
         * @param args on or off
         */
        Shell.prototype.shellTrace = function (args) {
            if (args.length === 1) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid argument.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        /**
         * Performs the rot13 utility
         * @param args the string being obfuscated
         */
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(" ") + " = '" + TSOS.Utils.rot13(args.join(" ")) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        /**
         * Changes the prompt to the args
         * @param args the desired prompt
         */
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        /**
         * Displays the date
         */
        Shell.prototype.shellDate = function () {
            var currentDate = new Date();
            _StdOut.putText("Current date is " + currentDate);
        };
        /**
         * Displays the current location
         */
        Shell.prototype.shellWhereami = function () {
            _StdOut.putText("Current location: Melon Country");
        };
        /**
         * Random melon pun generator that displays puns
         */
        Shell.prototype.shellMelon = function () {
            // Get a random number between 1 and 8
            var randomPun = Math.floor(Math.random() * 8);
            // Find an excellent pun for our melonicious users
            switch (randomPun) {
                case 0:
                    _StdOut.putText("Sur-round yourself with melons.");
                    break;
                case 1:
                    _StdOut.putText("It's not pulp fiction.");
                    break;
                case 2:
                    _StdOut.putText("This may sound a little 'fruity,' but we think you'll like it.");
                    break;
                case 3:
                    _StdOut.putText("Who says you cant(alope)?");
                    break;
                case 4:
                    _StdOut.putText("With melons you can!");
                    break;
                case 5:
                    _StdOut.putText("MelonOS has a thick skin and a fruity interior.");
                    break;
                case 6:
                    _StdOut.putText("Dew, or dew not, there is no try.");
                    break;
                case 7:
                    _StdOut.putText("Things aren't jellin with these melons.");
                    break;
            }
        };
        /**
         * Changes the Status to the args
         * @param args the desired status
         */
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var htmlStatus = document.getElementById("status");
                htmlStatus.innerHTML = "Status: " + args.join(" ");
            }
            else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        };
        /**
         * Create a process from the user input in HTML with an optional priority. Default is 1
         * @param args the priority
         */
        Shell.prototype.shellLoad = function (args) {
            // Get value inside program input (the program)
            var userInputProgram = document.getElementById("taProgramInput").value;
            // Create regex pattern
            var hexRegex = new RegExp(/[0-9A-Fa-f]{2}/i);
            // Check for anything besides hex or spaces (A-Fa-f0-9)
            if (hexRegex.test(userInputProgram)) {
                // Split the program into 2-bit hex
                var splitProgram = userInputProgram.split(" ");
                // If priority arg is a number
                if (args.length === 1 && args[0].match(/^[0-9]\d*$/)) {
                    // Create a process using the process manager
                    _MemoryManager.createProcess(splitProgram, args);
                    // Use default priority
                }
                else if (args.length === 0) {
                    _MemoryManager.createProcess(splitProgram, args);
                    // Invalid args
                }
                else {
                    _StdOut.putText("Usage: load [priority] Please supply a priority integer or use the default (1). 0 is the lowest.");
                }
            }
            else {
                _StdOut.putText("Program must only contain hexadecimal values (A-F, a-f, 0-9) or spaces.");
            }
        };
        /**
         * Crashes the OS in classic Blue Screen of Death fashion
         * ... with melons?
         */
        Shell.prototype.shellDropit = function () {
            var oops = "Who dropped those?";
            // Trigger the kernel trap error
            _Kernel.krnTrapError(oops);
        };
        /**
         * Run a loaded process by adding the process to the ready queue
         * @param args the loaded processId
         */
        Shell.prototype.shellRun = function (args) {
<<<<<<< HEAD:dist/scripts/os/shell.js
            if (args.length === 1 && !isNaN(parseInt(args[0]))) {
=======
            if (args.length == 1 && !isNaN(parseInt(args[0]))) {
>>>>>>> e2d99ff0c73008a06dbf4346644019b7d52dcb9e:distrib/os/shell.js
                var found = false;
                var waitQueueLength = _MemoryManager.residentQueue.getSize();
                // Check to see if CPU is already executing
                if (_CPU.isExecuting) {
                    _StdOut.putText("CPU is already in execution. Please wait until the current process is completed.");
                }
                else {
                    // Find the correct processId by looping through the waiting queue
                    for (var i = 0; i < waitQueueLength; i++) {
                        var pcb = _MemoryManager.residentQueue.dequeue();
                        if (pcb.pId == args[0]) {
                            // Put the pcb into the ready queue for execution
                            _MemoryManager.readyQueue.enqueue(pcb);
                            found = true;
                        }
                        else {
                            // Put the pcb back into the queue if it doesn't match
                            _MemoryManager.residentQueue.enqueue(pcb);
                        }
                    }
                    if (!found) {
                        _StdOut.putText("Invalid process ID. It may not exist?");
                    }
                }
            }
            else {
                _StdOut.putText("Usage: run <processID>  Please supply a processID.");
            }
        };
        /**
         * Clear all memory partitions
         */
        Shell.prototype.shellClearmem = function () {
            _Memory.clearAllMemory();
        };
        /**
         * Run all processes loaded in memory and HDD
         */
        Shell.prototype.shellRunall = function () {
            var waitQueueLength = _MemoryManager.residentQueue.getSize();
            // Check if there is any programs loaded
            if (waitQueueLength > 0) {
                // Add all resident pcbs to the ready queue
                for (var i = 0; i < waitQueueLength; i++) {
                    var pcb = _MemoryManager.residentQueue.dequeue();
                    _MemoryManager.readyQueue.enqueue(pcb);
                }
            }
            else {
                _StdOut.putText("There are no programs loaded. Please load a process to be executed.");
            }
        };
        /**
         * List all processes and pIDs
         */
        Shell.prototype.shellPs = function () {
            var waitQueueLength = _MemoryManager.residentQueue.getSize();
            // Check if any programs are loaded
            if (waitQueueLength > 0) {
                for (var i = 0; i < waitQueueLength; i++) {
                    var pcb = _MemoryManager.residentQueue.dequeue();
                    _StdOut.putText("Process ID: " + pcb.pId);
                    _StdOut.advanceLine();
                    _MemoryManager.residentQueue.enqueue(pcb);
                }
            }
            else {
                _StdOut.putText("No processes in resident queue.");
            }
            var readyQueueLength = _MemoryManager.readyQueue.getSize();
            /* Check if any programs are in ready queue.. although its not very practical to
            call this command while programs are executing with this weird CLI */
            if (readyQueueLength > 0) {
                for (var i = 0; i < readyQueueLength; i++) {
                    var pcb = _MemoryManager.readyQueue.dequeue();
                    _StdOut.putText("Process ID: " + pcb.pId);
                    _StdOut.advanceLine();
                    _MemoryManager.readyQueue.enqueue(pcb);
                }
            }
            else {
                _StdOut.putText("No processes in ready queue.");
            }
        };
        /**
         * Kill the specified process
         * @param args specified processId
         */
        Shell.prototype.shellKill = function (args) {
            // Check if there is an arg and its an integer
<<<<<<< HEAD:dist/scripts/os/shell.js
            if (args.length === 1 && isNaN(parseInt(args[0]))) {
                _MemoryManager.killProcess(parseInt(args[0]));
=======
            if (args.length == 1 && !isNaN(parseInt(args[0]))) {
                _MemoryManager.killProcess(args[0]);
>>>>>>> e2d99ff0c73008a06dbf4346644019b7d52dcb9e:distrib/os/shell.js
            }
            else {
                _StdOut.putText("Usage: kill <pid> Please supply a process ID.");
            }
        };
        /**
         * Change the round robin scheduling according to given <int>
         * @param args desired round robin schedule
         */
        Shell.prototype.shellQuantum = function (args) {
            // Check if there is an argument and if the argument is an integer
<<<<<<< HEAD:dist/scripts/os/shell.js
            if (args.length === 1 && isNaN(parseInt(args[0]))) {
=======
            if (args.length == 1 && !isNaN(parseInt(args[0]))) {
>>>>>>> e2d99ff0c73008a06dbf4346644019b7d52dcb9e:distrib/os/shell.js
                // Make sure the number is above 0. 0 will make melons enter the black hole
                if (parseInt(args[0]) > 0) {
                    // Notify the user that the quantum has been changed
                    _StdOut.putText("Quantum has been changed from " + _Scheduler.quantum + " to " + args[0]);
                    // Change the quantum
                    _Scheduler.changeQuantum(args[0]);
                }
                else {
                    _StdOut.putText("Usage: quantum <int> must be greater than 0.");
                }
            }
            else {
                _StdOut.putText("Usage: quantum <int>  Please supply an integer.");
            }
        };
        /**
         * List all non-hidden files on disk
         * @param args optional -l will list hidden files as well
         */
        Shell.prototype.shellLs = function (args) {
            // If they use -l, show all files including hidden
            if (args.length === 1 && args[0] === "-l") {
                // Get the list of files
                var filenames = _DiskDriver.listFiles();
                // Check if there is any files
                if (filenames.length > 0) {
                    _StdOut.putText("Files in the filesystem:");
                    _StdOut.advanceLine();
                    // Count swaps to see if there is no other files except for swaps
                    var numOfSwaps = 0;
                    for (var _i = 0, filenames_1 = filenames; _i < filenames_1.length; _i++) {
                        var f = filenames_1[_i];
                        // Don't show swap files
                        if (f['name'].includes("$SWAP")) {
                            numOfSwaps++;
                            continue;
                        }
                        _StdOut.putText(f['name'] + " - Date Created: " + f['month'] + "/" + f['day'] + "/" + f['year'] + ", Size: " + f['size']);
                        _StdOut.advanceLine();
                    }
                    // Let them know there's only swaps
                    if (numOfSwaps === filenames.length) {
                        _StdOut.putText("There are only swap files in the filesystem.");
                    }
                    // Let them know theres no files
                }
                else {
                    _StdOut.putText("There are no files in the filesystem.");
                }
                // Only display files that are not hidden and not swapped
            }
            else if (args.length === 0) {
                // Get the list of files
                var filenames = _DiskDriver.listFiles();
                // Check if there is any files
                if (filenames.length > 0) {
                    _StdOut.putText("Files in the filesystem:");
                    _StdOut.advanceLine();
                    // Counter swaps and hidden files to see if theyre the only files on disk
                    var numOfOtherFiles = 0;
                    for (var _a = 0, filenames_2 = filenames; _a < filenames_2.length; _a++) {
                        var f = filenames_2[_a];
                        // Don't show swap files and count
                        if (f['name'].includes("$SWAP")) {
                            numOfOtherFiles++;
                            continue;
                            // Show unhidden files
                        }
                        else if (f['name'].charAt(0) != ".") {
                            _StdOut.putText(f['name']);
                            _StdOut.advanceLine();
                            // Count hidden files
                        }
                        else {
                            numOfOtherFiles++;
                            continue;
                        }
                    }
                    // Let them know theres only 'other' files
                    if (numOfOtherFiles === filenames.length) {
                        _StdOut.putText("There are only swap/hidden files in the filesystem.");
                    }
                    // Let them know theres no files
                }
                else {
                    _StdOut.putText("There are no files in the filesystem.");
                }
                // Try again!
            }
            else {
                _StdOut.putText("Usage: ls [-l]");
            }
        };
        /**
         * Format/Initialize all blocks on disk. Defaults to full format
         * @param args optional quick or full format
         */
        Shell.prototype.shellFormat = function (args) {
            // Check if there is only 1 arg
            if (args.length === 1) {
                // Perform quick format
                if (args[0] === "-quick") {
                    if (_DiskDriver.format(QUICK_FORMAT)) {
                        _StdOut.putText("Disk formatted successfully!");
                    }
                    else {
                        _StdOut.putText("CPU is executing. Cannot format disk.");
                    }
                    // Perform full format
                }
                else if (args[0] === "-full") {
                    if (_DiskDriver.format(FULL_FORMAT)) {
                        _StdOut.putText("Disk formatted successfully!");
                    }
                    else {
                        _StdOut.putText("CPU is executing. Cannot format disk.");
                    }
                }
                else {
                    _StdOut.putText("Usage: format [-quick]|[-full]");
                }
                // Too many arguments..
            }
            else if (args.length > 1) {
                _StdOut.putText("Usage: format [-quick]|[-full]");
                // Default to full format
            }
            else {
                // Call the disk device driver to format the disk
                if (_DiskDriver.format(FULL_FORMAT)) {
                    _StdOut.putText("Disk formatted successfully!");
                }
                else {
                    _StdOut.putText("CPU is executing. Can't format disk.");
                }
            }
        };
        /**
         * Delete <filename> from disk
         * @param args filename
         */
        Shell.prototype.shellDeleteFile = function (args) {
            // Check if there is only 1 arg
            if (args.length === 1) {
                // Check if it is a swap file
                if (args[0].includes("$")) {
                    _StdOut.putText("Swap files cannot be deleted.");
                    // Back out of the function
                    return;
                }
                // Return the status of the file deletion
                var status_1 = _DiskDriver.deleteFile(args[0]);
                if (status_1 === SUCCESS) {
                    _StdOut.putText("The file: " + args[0] + " has been successfully deleted.");
                }
                else if (status_1 === FILENAME_DOESNT_EXIST) {
                    _StdOut.putText("The file: " + args[0] + " does not exist.");
                }
            }
            else {
                _StdOut.putText("Usage: delete <filename>  Please supply a filename.");
            }
        };
        /**
         * Write <filename> "data" to disk
         * @param args filename
         */
        Shell.prototype.shellWriteFile = function (args) {
            if (args.length >= 2) {
                // Avoid swap files
                if (args[0].includes("$")) {
                    _StdOut.putText("Cannot write to swapped file.");
                    return;
                }
                // If user entered spaces, concatenate the arguments
                var string = "";
                for (var i = 1; i < args.length; i++) {
                    string += args[i] + " ";
                }
                // Check to make sure the user has put quotes
                if (string.charAt(0) != "\"" || string.charAt(string.length - 2) != "\"") {
                    _StdOut.putText("Usage: write <filename> \"<text>\"  Please supply a filename and text surrounded by quotes.");
                    return;
                }
                string = string.trim();
                // Ensure characters and spaces are the only things written to the file
                if (!string.substring(1, string.length - 1).match(/^.[a-z ]*$/i)) {
                    _StdOut.putText("Files may only have characters and spaces written to them.");
                    return;
                }
                var info = _DiskDriver.writeFile(args[0], string);
                if (info === SUCCESS) {
                    _StdOut.putText("The file " + args[0] + " has been successfully written to.");
                }
                else if (info === FILENAME_DOESNT_EXIST) {
                    _StdOut.putText("The file " + args[0] + " does not exist.");
                }
                else if (info === DISK_IS_FULL) {
                    _StdOut.putText("Unable to write to the file: " + args[0] + ". Not enough disk space to write.");
                }
            }
            else {
                _StdOut.putText("Usage: write <filename> \"<text>\"  Please supply a filename and text surrounded by quotes.");
            }
        };
        /**
         * Read <filename> from disk
         * @param args filename
         */
        Shell.prototype.shellReadFile = function (args) {
            // Check if there is only 1 arg
            if (args.length === 1) {
                // Avoid swap files
                if (args[0].includes("$")) {
                    _StdOut.putText("Cannot read a swapped file.");
                    return;
                }
                var info = _DiskDriver.readFile(args[0]);
                // If it exists, print out file
                if (info.status === SUCCESS) {
                    _StdOut.putText(info.fileData.join(""));
                    // If it doesn't exist, let them know
                }
                else {
                    _StdOut.putText("The file " + args[0] + " does not exist.");
                }
            }
            else {
                _StdOut.putText("Usage: read <filename>  Please supply a filename.");
            }
        };
        /**
         * Create <filename> on disk
         * @param args filename
         */
        Shell.prototype.shellCreateFile = function (args) {
            // Check if there is only 1 arg
            if (args.length === 1) {
                // Filenames must be 60 characters or less
                if (args[0].length > 60) {
                    _StdOut.putText("File name is too long. It must be 60 characters or less.");
                    // Back out of the function
                    return;
                }
                // Return the status of the file creation
                var status_2 = _DiskDriver.createFile(args[0]);
                if (status_2 === SUCCESS) {
                    _StdOut.putText("File successfully created: " + args[0]);
                }
                else if (status_2 === FILENAME_EXISTS) {
                    _StdOut.putText("File name already exists. Please use another file name.");
                }
                // DISK_IS_FULL
                else {
                    _StdOut.putText("File creation failure: No more space on disk. Delete some?");
                }
            }
            else {
                _StdOut.putText("Usage: create <filename>  Please supply a filename.");
            }
        };
        /**
         * Display the current scheduling algorithm
         */
        Shell.prototype.shellGetSchedule = function () {
            if (_Scheduler.algorithm === RR) {
                _StdOut.putText("Current CPU scheduling algorithm is Round Robin and the quantum is " + _Scheduler.quantum + ".");
            }
            else if (_Scheduler.algorithm === FCFS) {
                _StdOut.putText("Current CPU scheduling algorithm is First Come First Serve and the quantum is " + _Scheduler.quantum + ".");
                // Priority
            }
            else {
                _StdOut.putText("Current CPU scheduling algorithm is Priority.");
            }
        };
        /**
         * Set the scheduling algorithm
         * @param args rr, fcfs, priority
         */
        Shell.prototype.shellSetSchedule = function (args) {
            // Check if there is args and that they match one of the allowed algorithms
            if (args.length === 1 && (args[0] === RR || args[0] === FCFS || args[0] === PRIORITY)) {
                _Scheduler.changeAlgorithm(args[0]);
                _StdOut.putText("CPU Scheduling algorithm set to " + args[0]);
            }
            else {
                _StdOut.putText("Usage: setschedule <algorithm>  Please supply an algorithm (rr, fcfs, or priority).");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
