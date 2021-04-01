import { SwitchableElement } from "../SwitchableElement.js";

export class EventableElement extends SwitchableElement {
    onOpen() {}
    onKeyDown(keys) {}
    onKeyUp(keys) {}
    onMouseMove(x, y) {}
    onMouseDown(evt) {}
    onMouseUp(evt) {}
    onFocus() {}
    onBlur() {}
    onResize() {}
}