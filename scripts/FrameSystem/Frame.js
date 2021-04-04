import { getFunctionBody, isEmpty, isNumeric, TasksManager } from "../Lib/index.js";
import { EventableElement } from "./ComponentBase/EventableElement.js";
import { FrameRenderableComponent } from "./ComponentBase/FrameRenderableComponent.js";
import { SwitchableElement } from "./SwitchableElement.js";

const currentFolderPath = import.meta.url.slice(0, import.meta.url.lastIndexOf('/') + 1);
let renderId = 0;

export class Frame extends SwitchableElement {
    constructor() {
        super();

        this._worker = new Worker(currentFolderPath + 'FrameWorker.js');

        this._tm = new TasksManager();

        this._shadow = this.attachShadow({
            mode: 'closed'
        });

        this._shadow.innerHTML = `
            <link rel="stylesheet" href="${currentFolderPath}frame-styles.css">
        
            <div class="frame-container">
                <canvas class="renderer"></canvas>
            </div>
        `;

        this._fc = this._shadow.querySelector('.frame-container');

        this._fc.requestFullScreen = this._fc.requestFullscreen || this._fc.webkitRequestFullScreen || this._fc.mozRequestFullScreen;
        this._fc.requestPointerLock = this._fc.requestPointerLock || this._fc.mozRequestPointerLock;

        /**
         * @type {HTMLCanvasElement}
         */
        this._canvas = this._fc.querySelector('canvas.renderer');
        this._ctx = this._canvas.getContext('2d');

        this._shadow.querySelector('link').onload = () => {
            this._tm.switchMode();
        }

        this._isChanging = this._isOpened = this._isFixed = this._isFullscreened = false;

        this._width = null;
        this._height = null;
        this._priority = 1;

        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
        this._postRender = this._postRender.bind(this);

        this._worker.addEventListener('message', this._postRender);

        /**
         * @type {Array<FrameComponent>}
         */
        this._onComponents = [];
        /**
         * @type {Array<FrameComponent>}
         */
        this._allComponents = [];

        this._renderableComp = [];

        let pn = performance.now();
        this._time = {
            lastFrame: pn,
            lastTick: pn,
            currentFrame: pn,
            currentTick: pn,
            deltaFrame: 0,
            deltaTick: 0
        };

        this._mouse = {
            down: {
                x: null,
                y: null,
                buttons: 0,
                isDown: false
            },
            up: {
                x: null,
                y: null,
                buttons: 0,
                isUp: false
            },
            move: {
                x: 0,
                y: 0,
                isMove: false
            }
        };

        this._keysDown = {};
        this._keysUp = {};

        this._fc.addEventListener('switchOff', e => {
            const trgt = e.target;
            if (trgt instanceof FrameComponent) {
                queueMicrotask(() => {
                    this._onComponents.delete(trgt);
                    if (trgt instanceof FrameRenderableComponent) {
                        this._renderableComp.delete(trgt);
                    }
                    this._allComponents.forEach(c => c.onSwitchOff(trgt));
                });
            }
        });

        this._fc.addEventListener('switchOn', e => {
            const trgt = e.target;
            if (trgt instanceof FrameComponent) {
                queueMicrotask(() => {
                    this._onComponents.push(trgt);
                    this._onComponents.sort(this._compSort);

                    if (trgt instanceof FrameRenderableComponent) {
                        this._renderableComp.push(trgt);
                        this._renderableComp.sort(this._rendCompSort);
                    }
                    this._allComponents.forEach(c => c.onSwitchOn(trgt));
                });
            }
        });

        console.log('created');
    }

    connectedCallback() {
        super.connectedCallback();
        if (!this._isOpened) {
            this.style.display = 'none';
        }
    }

    get ctx() {
        return this._ctx;
    }

    get time() {
        return this._time;
    }

    get isFullscreened() {
        return this._isFullscreened;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get priority() {
        return this._priority;
    }
    
    /**
     * Adds components
     * @param {Array<FrameComponent>} components 
     */
    addComponents(components) {
        queueMicrotask(() => {
            this._addComponents(components);
        });
    }

    _addComponents(components) {
        if (components instanceof Array) {
            components = components.filter(comp => comp instanceof FrameComponent);
            components.forEach(c => {
                this._fc.append(c);
                c.init(this);
                this._allComponents.push(c);

                if (c.isOn) {
                    this._onComponents.push(c);

                    if (c instanceof FrameRenderableComponent) {
                        this._renderableComp.push({
                            id: renderId,
                            component: c
                        });

                        this._worker.postMessage({
                            method: 'addRender',
                            id: renderId,
                            render: getFunctionBody(c.render),
                            initRender: getFunctionBody(c.initRender)
                        });
                        renderId++;
                    }
                }
            });

            if (this._isOpened) {
                components.forEach(c => {
                    if (c.isOn) {
                        c.onOpen();
                    }
                });
            }

            this._onComponents.sort(this._compSort);
            this._renderableComp.sort(this._rendCompSort);
        } else {
            throw new TypeError('Array expected');
        }
    }

    deleteComponent(component) {
        if (this._allComponents.delete(component)) {
            this._onComponents.delete(component);

            let rend = this._renderableComp.find(d => d.component == component);
            if (this._renderableComp.delete(rend)) {
                this._worker.postMessage({
                    method: 'deleteRender',
                    id: rend.id
                });
            }
            
            component.delete();
        }
    }

    getComponents(name) {
        return this._allComponents.filter(comp => comp.name == name);
    }
    
    /**
     * Opens frame in parentElement
     * @param {HTMLElement?} where parentElement
     */
    async open(where) {
        if (this._isOpened) {
            throw new TypeError('Frame already open');
        } else if (where instanceof HTMLElement) {
            where.append(this);

            this._isOpened = true;
            return this._tm.addTask(this._open);
        } else if (this.isConnected) {

            this._isOpened = true;
            return this._tm.addTask(this._open);
        } else {
            throw new TypeError('Missing parentElement');
        }
    }
    
    _open() {
        this.style.display = '';

        if (!this._isFixed || this._width == null || this._height == null) {
            this._resize();
        }

        this._time.lastTick = this._time.currentFrame = performance.now();

        this._checkChildren();
        console.log('oppened');

        this.dispatchEvent(new CustomEvent('open', {
            bubbles: true,
            cancelable: true,
            composed: true
        }));        
    }

    setSize(width, height) {
        if (isNumeric(width) && isNumeric(height)) {
            this._canvas.width = this._width = width;
            this._canvas.height = this._height = height;
            this._isFixed = true;
        } else {
            throw new TypeError('Numbers expected');
        }
    }

    resize() {
        if (!this._isFixed) this._resize();
    }

    _resize() {
        this._canvas.width = this._width = this._canvas.clientWidth;
        this._canvas.height = this._height = this._canvas.clientHeight;

        this._onComponents.forEach(c => c.onResize());
    }

    _checkChildren() {
        this.addComponents(Array.from(this.children));
    }

    async close() {
        if (this._isOpened) {
            this._isOpened = false;
            return this._tm.addTask(this._close);
        } else {
            throw new TypeError('Already closed');
        }
    }

    _close() {
        this.style.display = 'none';
        this.switchOff();
        console.log('closed');

        this.dispatchEvent(new CustomEvent('close', {
            bubbles: true,
            cancelable: true,
            composed: true
        }));
    }

    /**
     * @param {FrameComponent} a
     * @param {FrameComponent} b 
     */
    _compSort(a, b) {
        return a.tickPriority - b.tickPriority;
    }

    /**
     * @param {FrameRenderableComponent} a
     * @param {FrameRenderableComponent} b
     */
    _rendCompSort(a, b) {
        return a.component.renderPritority - b.component.renderPritority;
    }


    tick() {
        this._time.currentTick = performance.now();
        this._time.deltaTick = this._time.currentTick - this._time.lastTick;

        if (this._mouse.down.isDown) {
            this._onComponents.forEach(c => {
                c.onMouseDown(this._mouse.down);
            });

            this._mouse.down = {
                x: null,
                y: null,
                buttons: 0,
                isDown: false
            };
        }

        if (this._mouse.move.isMove) {
            this._onComponents.forEach(c => {
                c.onMouseMove(this._mouse.move.x, this._mouse.move.y);
            });

            this._mouse.move = {
                x: 0,
                y: 0,
                isMove: false
            };
        }

        if (this._mouse.up.isUp) {
            this._onComponents.forEach(c => {
                c.onMouseUp(this._mouse.up);
            });

            this._mouse.up = {
                x: null,
                y: null,
                buttons: 0,
                isUp: false
            };
        }

        if (!isEmpty(this._keysDown)) {
            this._onComponents.forEach(c => {
                c.onKeyDown(this._keysDown);
            });

            this._keysDown = {};
        }
        
        if (!isEmpty(this._keysUp)) {
            this._onComponents.forEach(c => {
                c.onKeyUp(this._keysUp);
            });

            this._keysUp = {};
        }

        this._onComponents.forEach(c => c.tick());

        this._time.lastTick = this._time.currentTick;
    }

    render() {
        this._time.lastFrame = this._time.currentFrame;
        this._time.currentFrame = performance.now();
        this._time.deltaFrame = this._time.currentFrame - this._time.lastFrame;

        this._worker.postMessage({
            method: 'render',
            inputs: this._renderableComp.map(data => {
                return {
                    id: data.id,
                    input: data.component.preRender()
                };
            })
        });

    }
    
    _postRender(e) {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this._ctx.textBaseline = 'top';
        this._ctx.font = '15px sans-serif';

        this._renderableComp.forEach(renderData => {
            renderData.component.postRender(this._ctx, e.data[renderData.id]);
        });
    }

    static get observedAttributes() {
        return ['fixed'].concat(super.observedAttributes);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);

        if (name === 'fixed') {
            if (newValue === null) {
                if (this._isFixed) {
                    this._isFixed = false;
                }
            } else {
                if (!this._isFixed) {
                    this._isFixed = true;
                }
            }
        }
    }

    keyDown(key) {
        this._keysDown[key] = true;
    }

    keyUp(key) {
        this._keysUp[key] = true;
    }

    mouseMove(x, y) {
        const moveData = this._mouse.move;
        moveData.isMove = true;
        moveData.x += x;
        moveData.y += y;
    }

    mouseDown(x, y, buttons) {
        const downData = this._mouse.down;
        downData.isDown = true;
        downData.x = x;
        downData.y = y;
        downData.buttons |= buttons;
    }

    mouseUp(x, y, buttons) {
        const upData = this._mouse.up;
        upData.isUp = true;
        upData.x = x;
        upData.y = y;
        upData.buttons |= buttons;
    }

    async toggleFullscreen() {
        if (this._isFullscreened) {
            return this.fullsceenOff();
        } else {
            return this.fullsceenOn();
        }
    }

    async fullsceenOff() {
        if (this._isChanging) {
            return 'screenOffing';
        } else {
            if (document.fullscreenElement) {
                this._isChanging = true;
                document.exitPointerLock();
                return document.exitFullscreen().then(() => {
                    this._isFullscreened = false;
                    this._isChanging = false;
                    return 'screenOff';
                });
            } else if (this._isFullscreened) {
                document.exitPointerLock();
                this._isFullscreened = false;
                return 'screenOff';
            }
        }
    }

    async fullsceenOn() {
        if (this._isChanging) {
            return 'screenOning';
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                document.exitPointerLock();
            }
            
            if (!this._isFullscreened) {
                this._isChanging = true;
                this._fc.requestPointerLock();
                return this._fc.requestFullscreen().then(() => {
                    this._isFullscreened = true;
                    this._isChanging = false;
                    return 'screenOn';
                });
            }
        }
    }

    onFocus() {
        this.setAttribute('focused', '');
        this._priority = 2;
        this._onComponents.forEach(c => c.onFocus());
    }

    onBlur() {
        this.removeAttribute('focused');
        this._priority = 1;
        this._onComponents.forEach(c => c.onBlur());
        this._mouse = {
            down: {
                x: null,
                y: null,
                buttons: 0,
                isDown: false
            },
            up: {
                x: null,
                y: null,
                buttons: 0,
                isUp: false
            },
            move: {
                x: 0,
                y: 0,
                isMove: false
            }
        };
    }
}

customElements.define('frame-element', Frame);

export class FrameComponent extends EventableElement {
    constructor() {
        super();
        this._tickPriority = 1;
        /**
         * @type {Frame}
         */
        this._frame = null;
        this._name = this.constructor.name;
    }

    get tickPriority() {
        return this._tickPriority;
    }

    get name() {
        return this._name;
    }
    
    init(frame) {
        this._frame = frame;
    }

    delete() {
        if (this._frame) {
            this._frame.deleteComponent(this);
            this._frame = null;
        }
    }

    tick() {}
}