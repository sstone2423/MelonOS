/* ------------
   shellCommand.ts
   This is the client OS implementation of a shell command.
   ------------ */

module TSOS {
    export class ShellCommand {
        func: any;
        command: string;
        description: string;

        constructor(func: any, command = "", description = "") {
            this.func = func;
            this.command = command;
            this.description = description;
        }
    }
}
