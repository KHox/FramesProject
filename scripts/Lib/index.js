export * from "./Math-Lib.js";
export * from "./Function_Lib.js";
export * from "./Object_Lib.js";
export * from "./classes/TasksManager.js";
export * from "./classes/Vec2.js";
export * from "./classes/InputFormater.js";
export * from "./classes/CoordData.js";
export * from "./classes/Transform.js";

Array.prototype.delete = function(elem) {
    let ind = this.indexOf(elem);
    if (ind != -1) {
        this.splice(ind, 1);
        return true;
    }
    return false;
};

document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;