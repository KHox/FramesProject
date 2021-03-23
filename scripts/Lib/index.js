export * from "./Math-Lib.js";
export * from "./Function_Lib.js";
export * from "./Object_Lib.js";

const canv = HTMLCanvasElement.prototype;
const fs = canv.requestFullScreen || canv.webkitRequestFullScreen || canv.mozRequestFullScreen;
const pl = canv.requestPointerLock || canv.mozRequestPointerLock;
document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

export function fullScreen(elem) {
    return fs.call(elem);
}

export function pointerLock(elem) {
    return pl.call(elem);
}