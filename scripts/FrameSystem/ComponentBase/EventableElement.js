import { SwitchableElement } from "../SwitchableElement.js";

export class EventableElement extends SwitchableElement {
    onOpen() {}
    onAddComponents(components) {}
    onKeyDown(keys) {}
    onKeyUp(keys) {}
    onMouseMove(evt) {}
    onMouseDown(evt) {}
    onMouseUp(evt) {}
    onClick(evt) {}
    onFocus() {}
    onBlur() {}
    onResize() {}
    onSwitchOn(comp) {}
    onSwitchOff(comp) {}
}