import { FrameComponent } from "./Frame.js";

let test = 0;

class myComponent extends FrameComponent {
    tick() {
        for (let i = 0; i < 2000000; i++) {
            test = (test + 1) % 100000;
        }
    }
}

customElements.define('my-component', myComponent);