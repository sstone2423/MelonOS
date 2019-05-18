/* ------------------------------
     DeviceDriver.ts
     The "base class" for all Device Drivers.
     ------------------------------ */

module TSOS {
    export class DeviceDriver {
        version: string = "0.07";
        status: string = "unloaded";
        preemptable: boolean = false;
        driverEntry = null;
        isr = null;
    }
}
