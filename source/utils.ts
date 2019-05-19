/* ------------
   utils.ts
   This is the client OS implementation of global utilities such as trim, rot13, 
   and converting ASCII strings to Hex
   ------------ */

module TSOS {
    export class Utils {
        /**
         * This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
         * You can do this in three lines with a complex regular expression, but I'd have
         * trouble explaining it in the future.  There's a lot to be said for obvious code.
         * @param str is the string being obfuscated
         */
        static rot13(str: string): string {
            let retVal = "";
            // We need to cast the string to any for use in the for...in construct.
            for (const i of str as any) {
                const ch: string = str[i];
                let code = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  /* It's okay to use 13.  
                                                               It's not a magic number,
                                                               it's called rot13. */
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }

            return retVal;
        }

        /**
         * Convert string to ASCII to hex
         * Returns an array of each character represented as hex
         * @param string is the string being converted
         */
        static stringToASCIItoHex(string: String): Array<string> {
            const hexArray: Array<string> = [];
            // Look at each character's ASCII value and convert it to a hex string
            for (let i = 0; i < string.length; i++){
                const hexChar = string.charCodeAt(i).toString(16);
                hexArray.push(hexChar);
            }

            return hexArray;
        }
    }
}
