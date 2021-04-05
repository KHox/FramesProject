import { SwitchableElement } from "../SwitchableElement.js";

export class EventableElement extends SwitchableElement {
    onOpen() {}
    onKeyDown(keys) {}
    onKeyUp(keys) {}
    onMouseMove(evt) {}
    onMouseDown(evt) {}
    onMouseUp(evt) {}
    onFocus() {}
    onBlur() {}
    onResize() {}
    onSwitchOn(comp) {}
    onSwitchOff(comp) {}
}