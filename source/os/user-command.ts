/* ------------
   userCommand.ts
   This is the client OS implementation of a user command.
   ------------ */

module TSOS {
    export class UserCommand {
        command: string;
        args: Array<string>;

        constructor(command = "", args: Array<string> = []) {
            this.command = command;
            this.args = args;
        }
    }
}
