///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    var Scheduler = /** @class */ (function () {
        function Scheduler() {
            // Set default quantum of 6
            this.quantum = 6;
        }
        // ShellQuantum calls this function
        Scheduler.prototype.changeQuantum = function (userQuantum) {
            // Change quantum to user given int
            this.quantum = userQuantum;
        };
        return Scheduler;
    }());
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
