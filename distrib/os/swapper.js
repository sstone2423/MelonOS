/* ------------
   swapper.ts
   This is the client OS implementation of a swapper.
   This is responsible for performing process swapping operations to and from disk.
   ------------ */
var TSOS;
(function (TSOS) {
    var Swapper = /** @class */ (function () {
        function Swapper() {
        }
        return Swapper;
    }());
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
