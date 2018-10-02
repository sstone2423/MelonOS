///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment
          center activities, serious injuries may occur when trying to
          write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let
// Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";
        public commandsUsedList = [];

        public init() {
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

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
        public execute(fn, args?) {
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

        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (const i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                const topic = args[0];
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
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
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

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(" ") + " = '" + Utils.rot13(args.join(" ")) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate() {
            const currentDate = new Date();
            _StdOut.putText("Current date is " + currentDate);
        }

        public shellWhereami() {
            _StdOut.putText("Current location is Melon Country");
        }

        public shellMelon() {
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

        public shellStatus(args) {
            if (args.length > 0) {
                const htmlStatus = document.getElementById("status");
                htmlStatus.innerHTML = "Status: " + args;
            } else {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }
        }

        public shellLoad() {
            // Get value inside program input (the program)
            const userInputProgram = document.getElementById("taProgramInput").value;
            // Create regex pattern
            const hexRegex = new RegExp("^[a-fA-F0-9\s]+$");
            // Check for anything besides hex or spaces (A-Fa-f0-9)
            if (hexRegex.test(userInputProgram)) {
                // Load program into memory (currently just outputs success)
                _StdOut.putText("Success");
            } else {
                _StdOut.putText("Program must only contain hexadecimal values (A-F, a-f, 0-9) or spaces.");
            }
            // Split the program into 2-bit hex
            let splitProgram = userInputProgram.split(" ");
            // Create a process using the process manager
            _MemoryManager.createProcess(splitProgram);
        }

        public shellDropit() {
            const oops = "Who dropped those?";
            _Kernel.krnTrapError(oops);
        }

        public shellRun() {
            
        }
    }
}
