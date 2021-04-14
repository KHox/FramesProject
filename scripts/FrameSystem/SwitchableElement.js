export const switchableAttrName = 'disabled';

export class SwitchableElement extends HTMLElement {
    constructor() {
        super();

        this._switchMode = null;
    }

    get isOn() {
        return this._switchMode;
    }
    
    connectedCallback() {
        this.attributeChangedCallback(switchableAttrName, null, this.getAttribute(switchableAttrName));
    }

    toggleSwitch() {
        this.toggleAttribute(switchableAttrName);
    }

    switchOn() {
        this.removeAttribute(switchableAttrName);
    }

    switchOff() {
        this.setAttribute(switchableAttrName, '');
    }

    static get observedAttributes() {
        return [switchableAttrName];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === switchableAttrName) {
            if (newValue === null) {
                if (!this._switchMode) {
                    this._switchMode = true;
                    
                    this.dispatchEvent(
                        new CustomEvent('switchOn', {
                            cancelable: true,
                            bubbles: true,
                            detail: {
                                target: this
                            }
                        })
                    );
                }
            } else {
                if (this._switchMode !== false) {
                    this._switchMode = false;

                    this.parentNode.dispatchEvent(
                        new CustomEvent('switchOff', {
                            cancelable: true,
                            bubbles: true,
                            detail: {
                                target: this
                            }
                        })
                    );
                }
            }
        }
    }
}