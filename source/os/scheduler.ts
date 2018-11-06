///<reference path="../globals.ts" />

module TSOS {

    export class Scheduler {
        public quantum: number;
        public timer: number;
        public algorithm: string;

        constructor() {
            // Set timer to 0
            this.timer = 0;
            // Set default quantum of 6
            this.quantum = 6;
            // Set default algorithm to RR
            this.algorithm = "RR";
        }

        // ShellQuantum calls this function
        public changeQuantum(userQuantum): void {
            // Change quantum to user given int
            this.quantum = userQuantum;
        }

        // Change the algorithm
        public changeAlgorithm(algorithm): void {
            this.algorithm = algorithm;
        }

        // Reset the timer
        public resetTimer(): void {
            this.timer = 0;
        }
    }
}
