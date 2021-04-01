class WindowsFrame extends HTMLElement {
    constructor() {
        super();
        this.style.display = 'none';

        this._s = this.attachShadow({
            mode: 'closed'
        });


        this._s.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                :host > .main-container {
                    width: calc(100% - 2px);
                    height: calc(100% - 2px);
                    padding: 1px;
                    background-color: aliceblue;
                }
                
                :host .header {
                    width: 100%;
                    height: 30px;
                    background-color: aliceblue;
                }

                :host frame-element {
                    width: 100%;
                    height: calc(100% - 30px);
                }
            </style>
            <div class="main-container">
                <div preudo="-windows-frame-header" class="header">
                    <div class="frame-button minimize"></div>
                    <div class="frame-button full"></div>
                    <div class="frame-button close"></div>
                </div>
                <frame-element>
                </frame-element>
            </div>
        `;

        this._frame = this._s.querySelector('frame-element');
    }

    open() {
        this.style.display = '';
        Array.from(this.children).forEach(c => {
            this._frame.append(c);
        });
        return this._frame.open();
    }
}

customElements.define('windows-frame', WindowsFrame);