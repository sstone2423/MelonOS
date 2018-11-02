///<reference path="../globals.ts" />

module TSOS {

    export class Scheduler {
        public quantum: number;

        constructor() {
            // Set default quantum of 6
            this.quantum = 6;
        }

        // ShellQuantum calls this function
        public changeQuantum(userQuantum) {
            // Change quantum to user given int
            this.quantum = userQuantum;
        }
    }
}
