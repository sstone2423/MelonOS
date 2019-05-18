/* ------------------------------
     charcode.ts
     Character code constants
     ------------------------------ */

     module TSOS {
        export const enum CharCode {
            // Letters
            A = 65,
            Z = 90,
            a = 97,
            z = 123,
            // Digits
            Zero = 48,
            One = 49,
            Two = 50,
            Three = 51,
            Four = 52,
            Five = 53,
            Six = 54,
            Seven = 55,
            Eight = 56, 
            Nine = 57,
            Enter = 13,
            // Symbols
            RParen = 41,
            Exclamation = 33,
            Backquote = 192,
            LBracket = 219,
            RBracket = 221,
            Backslash = 220,
            Dash = 189,
            Comma = 188,
            Period = 190,
            Colon = 186,
            Slash = 191,
            SingleQuote = 222,
            Equals = 187,
            // Commands
            Space = 32,
            Backspace = 8,
            Tab = 9,
            Up = 38,
            Down = 40
        }
    }
    