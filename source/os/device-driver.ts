/* ------------------------------
     DeviceDriver.ts
     The "base class" for all Device Drivers.
     ------------------------------ */

module TSOS {
    export class DeviceDriver {
        version = "0.07";
        status = "unloaded";
        preemptable = false;
        driverEntry = null;
        isr = null;
    }
}
