/* ------------
   userCommand.ts
   This is the client OS implementation of a user command.
   ------------ */

module TSOS {
    export class UserCommand {
        constructor(public command = "",
                    public args = []) { }
    }
}
