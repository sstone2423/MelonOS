///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            // Set timer to 0
            this.timer = 0;
            // Set default quantum of 6
            this.quantum = 6;
            // Set default algorithm to RR
            this.algorithm = "RR";
        }
        // ShellQuantum calls this function
        Scheduler.prototype.changeQuantum = function (userQuantum) {
            // Change quantum to user given int
            this.quantum = userQuantum;
        };
        // Change the algorithm
        Scheduler.prototype.changeAlgorithm = function (algorithm) {
            this.algorithm = algorithm;
        };
        // Reset the timer
        Scheduler.prototype.resetTimer = function () {
            this.timer = 0;
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
