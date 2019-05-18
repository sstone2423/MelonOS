/* ------------
   Interrupt.ts
   ------------ */

module TSOS {
    export class Interrupt {
        irq: number;
        params: any;

        constructor(irq: number, params: any) {
            this.irq = irq;
            this.params = params;
        }
    }
}
