/* ------------
   shellCommand.ts
   This is the client OS implementation of a shell command.
   ------------ */

module TSOS {
    export class ShellCommand {
        constructor(
            public func: any,
            public command: string = "",
            public description: string = ""
        ) { }
    }
}
