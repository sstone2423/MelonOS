/* ------------
   utils.ts
   This is the client OS implementation of global utilities such as trim, rot13, 
   and converting ASCII strings to Hex
   ------------ */

module TSOS {
    export class Utils {
        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            let retVal: string = "";
            for (const i of str as any) {    // We need to cast the string to any for use in the for...in construct.
                const ch: string = str[i];
                let code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number,
                                                            // it's called rot13.
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

        // Convert string to ASCII to hex
        public static stringToASCIItoHex(string: String): Array<string> {
            let hexArray = [];
            // Look at each character's ASCII value and convert it to a hex string
            for (let i = 0; i < string.length; i++){
                let hexChar = string.charCodeAt(i).toString(16);
                hexArray.push(hexChar);
            }
            // Returns an array of each character represented as hex
            return hexArray;
        }
    }
}
