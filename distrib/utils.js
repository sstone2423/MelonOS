/* ------------
   utils.ts
   This is the client OS implementation of global utilities such as trim, rot13,
   and converting ASCII strings to Hex
   ------------ */
var TSOS;
(function (TSOS) {
    var Utils = /** @class */ (function () {
        function Utils() {
        }
        Utils.trim = function (str) {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        };
        Utils.rot13 = function (str) {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal = "";
            for (var _i = 0, _a = str; _i < _a.length; _i++) { // We need to cast the string to any for use in the for...in construct.
                var i = _a[_i];
                var ch = str[i];
                var code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13; // It's okay to use 13.  It's not a magic number,
                    // it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                }
                else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;
                    retVal = retVal + String.fromCharCode(code);
                }
                else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        };
        // Convert string to ASCII to hex
        Utils.stringToASCIItoHex = function (string) {
            var hexArray = [];
            // Look at each character's ASCII value and convert it to a hex string
            for (var i = 0; i < string.length; i++) {
                var hexChar = string.charCodeAt(i).toString(16);
                hexArray.push(hexChar);
            }
            // Returns an array of each character represented as hex
            return hexArray;
        };
        return Utils;
    }());
    TSOS.Utils = Utils;
})(TSOS || (TSOS = {}));
