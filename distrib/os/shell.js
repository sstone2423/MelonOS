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
// TODO: Write a base class / prototype for system services and let
// Shell inherit from it.
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
        Shell.prototype.init = function () {
            var sc;
            // Load the command list.
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
            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- Sets the round robin quantum to the specific integer.");
            this.commandList[this.commandList.length] = sc;
            // Display the initial prompt.
            this.putPrompt();
        };
        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };
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
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
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
        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg !== "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };
        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };
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
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };
        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };
        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };
        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };
        Shell.prototype.shellMan = function (args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "curse":
                        _StdOut.putText("Curse issues all of your derogatory remarks for you!");
                        break;
                    case "apology":
                        _StdOut.putText("Apology mends your relationship with MelonOS because it has feelings too.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current version.");
                        break;
                    case "v":
                        _StdOut.putText("V displays the current version.");
                        break;
                    case "version":
                        _StdOut.putText("Version displays the current version.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown calls the kernel shutdown routine.");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen for additional melons.");
                        break;
                    case "trace":
                        _StdOut.putText("Trace displays the clock intervals.");
                        break;
                    case "rot13":
                        _StdOut.putText("Rot13 converts characters in the string to character + 13. "
                            + "It was one of the first ciphers created.");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt changes the initial prompt to the specific string.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays the current location.");
                        break;
                    case "melon":
                        _StdOut.putText("Melon will give you juicy puns to use with all of your friends!");
                        break;
                    case "status":
                        _StdOut.putText("Status changes the status display bar to whatever string your"
                            + " heart desires.");
                        break;
                    case "load":
                        _StdOut.putText("Load validates the user input program to ensure only hex digits"
                            + " and spaces exist.");
                        break;
                    case "dropit":
                        _StdOut.putText("Dropit can not be undone.. Please don't drop the melons."
                            + " and spaces exist.");
                        break;
                    case "run":
                        _StdOut.putText("Run will run the current process loaded in memory.");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clearmem will *cough* init *cough* clear all memory partitions.");
                        break;
                    case "runall":
                        _StdOut.putText("Runall will execute all programs in memory.");
                        break;
                    case "ps":
                        _StdOut.putText("Ps will list all processes and their process IDs.");
                        break;
                    case "kill":
                        _StdOut.putText("Kill <id> will terminate the corresponding process");
                        break;
                    case "quantum":
                        _StdOut.putText("Quantum <int> will change the round round scheduling time.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        };
        Shell.prototype.shellTrace = function (args) {
            if (args.length > 0) {
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
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        };
        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(" ") + " = '" + TSOS.Utils.rot13(args.join(" ")) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };
        Shell.prototype.shellDate = function () {
            var currentDate = new Date();
            _StdOut.putText("Current date is " + currentDate);
        };
        Shell.prototype.shellWhereami = function () {
            _StdOut.putText("Current location is Melon Country");
        };
        Shell.prototype.shellMelon = function () {
            // Get a random number between 1 and 8
            var randomPun = Math.floor(Math.random() * 8) + 1;
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
        };
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var htmlStatus = document.getElementById("status");
                htmlStatus.innerHTML = "Status: " + args;
            }
            else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        };
        Shell.prototype.shellLoad = function () {
            // Get value inside program input (the program)
            var userInputProgram = document.getElementById("taProgramInput").value;
            // Create regex pattern
            var hexRegex = new RegExp(/[0-9A-Fa-f]{2}/i);
            // Check for anything besides hex or spaces (A-Fa-f0-9)
            if (hexRegex.test(userInputProgram)) {
                // Split the program into 2-bit hex
                var splitProgram = userInputProgram.split(" ");
                // Create a process using the process manager
                _MemoryManager.createProcess(splitProgram);
            }
            else {
                _StdOut.putText("Program must only contain hexadecimal values (A-F, a-f, 0-9) or spaces.");
            }
        };
        // Display BSOD....
        Shell.prototype.shellDropit = function () {
            var oops = "Who dropped those?";
            // Trigger the kernel trap error
            _Kernel.krnTrapError(oops);
        };
        // Add the process to the ready queue - Arg will be the processId
        Shell.prototype.shellRun = function (args) {
            if (args.length > 0 && Number.isInteger(parseInt(args[0]))) {
                var found = false;
                var waitQueueLength = _MemoryManager.residentQueue.getSize();
                // Check to see if CPU is already executing
                if (_CPU.isExecuting) {
                    _StdOut.putText("Process is already in execution");
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
        // Clear all memory partitions
        Shell.prototype.shellClearmem = function () {
        };
        // Run all processes in memory
        Shell.prototype.shellRunall = function () {
        };
        // List all processes and pIDs
        Shell.prototype.shellPs = function () {
        };
        // Kill process according to given <pid>
        Shell.prototype.shellKill = function (args) {
        };
        // Change the round robin scheduling according to given <int>
        Shell.prototype.shellQuantum = function (args) {
            // Check if there is an argument and if the argument is an integer
            if (args.length > 0 && Number.isInteger(parseInt(args[0]))) {
                // Notify the user that the quantum has been changed
                _StdOut.putText("Quantum has been changed from " + _Scheduler.quantum + " to " + args[0]);
                // Change the quantum
                _Scheduler.changeQuantum(args[0]);
            }
            else {
                _StdOut.putText("Usage: quantum <int>  Please supply an integer.");
            }
        };
        return Shell;
    }());
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
