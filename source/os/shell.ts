///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="memoryManager.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment
          center activities, serious injuries may occur when trying to
          write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public commandsUsedList = [];

        public init(): void {
            let sc;      
            // Load the command list.
            // v
            sc = new ShellCommand(this.shellVer,
                                  "v",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // version
            sc = new ShellCommand(this.shellVer,
                                  "version",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the "
                                  + "underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate,
                                  "date",
                                  "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereami,
                                  "whereami",
                                  "- Displays the current location.");
            this.commandList[this.commandList.length] = sc;

            // melon
            sc = new ShellCommand(this.shellMelon,
                                  "melon",
                                  "- Displays wonderful melon puns for the world to see.");
            this.commandList[this.commandList.length] = sc;

            // status
            sc = new ShellCommand(this.shellStatus,
                                  "status",
                                  "- Changes the status display bar to whatever your heart desires.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad,
                                  "load",
                                  "- Loads and validates the user code in the user input area. Only"
                                  + " hex digits and spaces are valid.");
            this.commandList[this.commandList.length] = sc;

            // dropit
            sc = new ShellCommand(this.shellDropit,
                                  "dropit",
                                  "- Please don't drop those..");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                                  "run",
                                  "- Run the program currently loaded in memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearmem,
                                  "clearmem",
                                  "- Clears all memory partitions.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunall,
                                  "runall",
                                  "- Run all programs currently loaded in memory.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                                  "ps",
                                  "- Display all processes and their IDs.");
            this.commandList[this.commandList.length] = sc;

            // kill <id>
            sc = new ShellCommand(this.shellKill,
                                  "kill",
                                  "- Kills the specified process ID.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLs,
                                  "ls",
                                  "- Lists files currently on disk.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new ShellCommand(this.shellGetSchedule,
                                  "getschedule",
                                  "- Returns the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // setschedule rr, fcfs, priority
            sc = new ShellCommand(this.shellSetSchedule,
                                  "setschedule",
                                  "<rr, fcfs, priority> - Sets the CPU scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat,
                                  "format",
                                  "- Initialize all blocks in all sectors in all tracks.");
            this.commandList[this.commandList.length] = sc;

            // delete <filename>
            sc = new ShellCommand(this.shellDelete,
                                  "delete",
                                  "<filename> - Delete the specified file from disk.");
            this.commandList[this.commandList.length] = sc;

            // write <filename> "data"
            sc = new ShellCommand(this.shellWrite,
                                  "write",
                                  "<filename> \"data\" - Write data to the specified file on disk.");
            this.commandList[this.commandList.length] = sc;

            // read <filename>
            sc = new ShellCommand(this.shellRead,
                                  "read",
                                  "<filename> - Read the specified file from disk.");
            this.commandList[this.commandList.length] = sc;

            // create <filename>
            sc = new ShellCommand(this.shellCreateFile,
                                  "create",
                                  "<filename> - Create a file fon disk.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt(): void {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer): void {
            _Kernel.krnTrace("Shell Command~" + buffer);

            // Parse the input...

            const userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local letiables.
            const cmd = userCommand.command;
            const args = userCommand.args;

            // Determine the command and execute it.

            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out
            // and tell me in class.
            let index: number = 0;
            let found: boolean = false;
            let fn;

            // Loop until every command in the commandList has been read
            while (!found && index < this.commandList.length) {
                // First commandList entry
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                    // Save the command in commandsUsedList for a command history
                    this.commandsUsedList.push(this.commandList[index].command);
                // Second commandList entry
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?): void {
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
        }

        public parseInput(buffer): UserCommand {
            const retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            const tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            let cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (const i in tempList) {
                const arg = Utils.trim(tempList[i]);
                if (arg !== "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.

        public shellInvalidCommand(): void {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse(): void {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology(): void {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args): void {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args): void {
            _StdOut.putText("Commands:");
            for (const i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args): void {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args): void {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args): void {
            if (args.length > 0) {
                const topic = args[0];
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
                        _StdOut.putText("ls lists all non-hidden files on disk.");
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
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args): void {
            if (args.length > 0) {
                const setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args): void {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(" ") + " = '" + Utils.rot13(args.join(" ")) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args): void {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(): void {
            const currentDate = new Date();
            _StdOut.putText("Current date is " + currentDate);
        }

        public shellWhereami(): void {
            _StdOut.putText("Current location is Melon Country");
        }

        public shellMelon(): void {
            // Get a random number between 1 and 8
            const randomPun = Math.floor(Math.random() * 8) + 1;

            // Find an excellent pun for our melonicious users
            switch (randomPun) {
                case 1:
                    _StdOut.putText("Sur-round yourself with melons.");
                    break;
                case 2:
                    _StdOut.putText("It's not pulp fiction.");
                    break;
                case 3:
                    _StdOut.putText("This may sound a little 'fruity,' but we think you'll like it.");
                    break;
                case 4:
                    _StdOut.putText("Who says you cant(alope)?");
                    break;
                case 5:
                    _StdOut.putText("With melons you can!");
                    break;
                case 6:
                    _StdOut.putText("MelonOS has a thick skin and a fruity interior.");
                    break;
                case 7:
                    _StdOut.putText("Dew, or dew not, there is no try.");
                    break;
                case 8:
                    _StdOut.putText("Things aren't jellin with these melons.");
                    break;
            }
        }

        public shellStatus(args): void {
            if (args.length > 0) {
                const htmlStatus = document.getElementById("status");
                htmlStatus.innerHTML = "Status: " + args;
            } else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        }

        public shellLoad(): void {
            // Get value inside program input (the program)
            const userInputProgram = (<HTMLInputElement>document.getElementById("taProgramInput")).value;
            // Create regex pattern
            const hexRegex = new RegExp(/[0-9A-Fa-f]{2}/i);
            // Check for anything besides hex or spaces (A-Fa-f0-9)
            if (hexRegex.test(userInputProgram)) {
                // Split the program into 2-bit hex
                let splitProgram = userInputProgram.split(" ");
                // Create a process using the process manager
                _MemoryManager.createProcess(splitProgram);
            } else {
                _StdOut.putText("Program must only contain hexadecimal values (A-F, a-f, 0-9) or spaces.");
            }
        }
        
        // Display BSOD....
        public shellDropit(): void {
            const oops = "Who dropped those?";
            // Trigger the kernel trap error
            _Kernel.krnTrapError(oops);
        }

        // Add the process to the ready queue - Arg will be the processId
        public shellRun(args): void {
            if (args.length > 0 && Number.isInteger(parseInt(args[0]))) {
                let found = false;
                let waitQueueLength = _MemoryManager.residentQueue.getSize();
                // Check to see if CPU is already executing
                if (_CPU.isExecuting) {
                    _StdOut.putText("Process is already in execution");
                } else {
                    // Find the correct processId by looping through the waiting queue
                    for (let i = 0; i < waitQueueLength; i++) {
                        let pcb = _MemoryManager.residentQueue.dequeue();
                        if (pcb.pId == args[0]) {
                            // Put the pcb into the ready queue for execution
                            _MemoryManager.readyQueue.enqueue(pcb);
                            found = true;
                        } else {
                            // Put the pcb back into the queue if it doesn't match
                            _MemoryManager.residentQueue.enqueue(pcb);
                        }
                    }
                    if (!found) {
                        _StdOut.putText("Invalid process ID. It may not exist?");
                    }
                }
            } else {
                _StdOut.putText("Usage: run <processID>  Please supply a processID.")
            }
        }

        // Clear all memory partitions
        public shellClearmem(): void {
            // Check if CPU is executing
            if (!_CPU.isExecuting) {
                let readyQueueLength = _MemoryManager.readyQueue.getSize();
                // Check ready queue first since these will be executing shortly
                if (readyQueueLength > 0) {
                    for (let i = 0; i < readyQueueLength; i++) {
                        // Kill the process
                        let pcb = _MemoryManager.readyQueue.dequeue();
                        // Clear the memory partition
                        _Memory.clearPartition(pcb.partition);
                        _StdOut.putText("Clearing Process ID: " + pcb.pId + " from partition: " + pcb.partition);
                        _StdOut.advanceLine();
                    }
                }
                // Check wait queue second
                let waitQueueLength = _MemoryManager.residentQueue.getSize();
                if (waitQueueLength > 0) {
                    for (let i = 0; i < waitQueueLength; i++) {
                        // Kill the process
                        let pcb = _MemoryManager.residentQueue.dequeue();
                        // Clear the memory partition
                        _Memory.clearPartition(pcb.partition);
                        _StdOut.putText("Clearing Process ID: " + pcb.pId + " from partition: " + pcb.partition);
                        _StdOut.advanceLine();
                    }
                }
            }
        }

        // Run all processes in memory
        public shellRunall(): void {
            let waitQueueLength = _MemoryManager.residentQueue.getSize();
            // Check if there is any programs loaded
            if (waitQueueLength > 0) {
                // Add all resident pcbs to the ready queue
                for (let i = 0; i < waitQueueLength; i++) {
                    let pcb = _MemoryManager.residentQueue.dequeue();
                    _MemoryManager.readyQueue.enqueue(pcb);
                }
            } else {
                _StdOut.putText("There are no programs loaded. Please load a process to be executed.");
            }
        }

        // List all processes and pIDs
        public shellPs(): void {
            let waitQueueLength = _MemoryManager.residentQueue.getSize();
            // Check if any programs are loaded
            if (waitQueueLength > 0) {
                for (let i = 0; i < waitQueueLength; i++) {
                    let pcb = _MemoryManager.residentQueue.dequeue();
                    _StdOut.putText("Process ID: " + pcb.pId);
                    _StdOut.advanceLine();
                    _MemoryManager.residentQueue.enqueue(pcb);
                }
            } else {
                _StdOut.putText("No processes in resident queue.");
            }
            let readyQueueLength = _MemoryManager.readyQueue.getSize();
            /* Check if any programs are in ready queue.. although its not very practical to 
            call this command while programs are executing with this weird CLI */
            if (readyQueueLength > 0) {
                for (let i = 0; i < readyQueueLength; i++) {
                    let pcb = _MemoryManager.readyQueue.dequeue();
                    _StdOut.putText("Process ID: " + pcb.pId);
                    _StdOut.advanceLine();
                    _MemoryManager.readyQueue.enqueue(pcb);
                }
            } else {
                _StdOut.putText("No processes in ready queue.");
            }
        }

        // Kill process according to given <pid>
        public shellKill(args): void {
            // Check if there is an arg and its an integer
            if (args.length > 0 && Number.isInteger(parseInt(args[0]))) {
                _MemoryManager.killProcess(args[0]);
            } else {
                _StdOut.putText("Usage: kill <pid> Please supply a process ID.");
            }
        }

        // Change the round robin scheduling according to given <int>
        public shellQuantum(args): void {
            // Check if there is an argument and if the argument is an integer
            if (args.length > 0 && Number.isInteger(parseInt(args[0]))) {
                // Make sure the number is above 0. 0 will make melons enter the black hole
                if (args[0] > 0) {
                    // Notify the user that the quantum has been changed
                    _StdOut.putText("Quantum has been changed from " + _Scheduler.quantum + " to " + args[0]);
                    // Change the quantum
                    _Scheduler.changeQuantum(args[0]);
                } else {
                    _StdOut.putText("Usage: quantum <int> must be greater than 0.")
                }
            } else {
                _StdOut.putText("Usage: quantum <int>  Please supply an integer.");
            }
        }

        // List all non-hidden files on disk
        public shellLs(): void {
            // Check if files are not hidden, then print to console
        }

        // Format/Initialize all blocks on disk
        public shellFormat(): void {

        }

        // Delete <filename> from disk
        public shellDelete(args): void {

        }

        // Write <filename> "data" to disk
        public shellWrite(args): void {

        }

        // Read <filename> from disk
        public shellRead(args): void {

        }

        // Create <filename> on disk
        public shellCreateFile(args): void {
            // Check if there is only 1 arg
            if (args.length == 1) {
                // Filenames must be 60 characters or less
                if(args[0].length > 60){
                    _StdOut.putText("File name is too long. It must be 60 characters or less.");
                }
                // Return the status of the file creation
                let status = _DiskDriver.createFile(args[0]);
                if (status == SUCCESS) {
                    _StdOut.putText("File successfully created: " + args[0]);
                } else if (status == FILE_NAME_EXISTS) {
                    _StdOut.putText("File name already exists.");
                }
                else if (status == DISK_IS_FULL) {
                    _StdOut.putText("File creation failure: No more space on disk.");
                }
            }
            else {
                _StdOut.putText("Usage: create <filename>  Please supply a filename.");
            }
        }

        // Get the current scheduling algorithm
        public shellGetSchedule(): void {
            _StdOut.putText("Current CPU scheduling algorithm is " + _Scheduler.algorithm);
        }

        // Set the scheduling algorithm to rr, fcfs, priority
        public shellSetSchedule(args): void {
            // Check if there is args and that they match one of the allowed algorithms
            if (args.length > 0 && (args[0] == "rr" || args[0] == "fcfs" || args[0] == "priority")) {
                _Scheduler.changeAlgorithm(args[0]);
                _StdOut.putText("CPU Scheduling algorithm set to " + args[0]);
            } else {
                _StdOut.putText("Usage: setschedule <algorithm>  Please supply an algorithm (rr, fcfs, or priority).");
            }
        }
    }
}
