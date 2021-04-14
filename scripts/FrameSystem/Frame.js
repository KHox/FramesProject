import { getFunctionBody, isEmpty, isNumeric, TasksManager } from "../Lib/index.js";
import { EventableElement } from "./ComponentBase/EventableElement.js";
import { FrameRenderableComponent } from "./ComponentBase/FrameRenderableComponent.js";

const onAddComp = Symbol("onAddComp");
const tick = Symbol("tick");
const onOpen = Symbol('onOpen');
const onKeyDown = Symbol('onKeyDown');
const onKeyUp = Symbol('onKeyUp');
const onMouseMove = Symbol('onMouseMove');
const onMouseDown = Symbol('onMouseDown');
const onMouseUp = Symbol('onMouseUp');
const onClick = Symbol('onClick');
const onFocus = Symbol('onFocus');
const onBlur = Symbol('onBlur');
const onResize = Symbol('onResize');
const onSwitchOn = Symbol('onSwitchOn');
const onSwitchOff = Symbol('onSwitchOff');
const onTouchStart = Symbol('onTouchStart');
const onTouchMove = Symbol('onTouchMove');
const onTouchEnd = Symbol('onTouchEnd');
const onTouchCancel = Symbol('onTouchCancel');
const onToggleScreen = Symbol('onToggleScreen');

const currentFolderPath = import.meta.url.slice(0, import.meta.url.lastIndexOf('/') + 1);
let renderId = 0;

export class FrameComponent extends EventableElement {
    constructor() {
        super();
        this._tickPriority = 1;
        /**
         * @type {Frame}
         */
        this._frame = null;
        /**
         * @type {FrameComponent}
         */
        this._parent = null;
        this._name = this.constructor.name;

        /**
         * @type {Array<FrameComponent>}
         */
        this._allComponents = [];
        this._cont = this;
    }

    get tickPriority() {
        return this._tickPriority;
    }

    get name() {
        return this._name;
    }

    get parent() {
        return this._parent;
    }
    
    init(frame, parent) {
        this._frame = frame;
        this._parent = parent;
        this._allComponents.forEach(c => {
            c.init(frame, this);
        });
    }

    [tick]() {
        this.tick();
        this._allComponents.forEach(c => {
            if (c.isOn) {
                c[tick]();
            }
        });
    }

    tick() {}

    getComponents(name) {
        return this._allComponents.filter(comp => comp.name == name);
    }

    /**
     * @param {Array<FrameComponent>} components
     */
    addComponents(components) {
        components = components.filter(c => c instanceof FrameComponent);
        components.forEach(c => {
            this._cont.append(c);
            c.init(this._frame, this);
        });

        let renderables = components.reduce((rend, comp) => {
            return rend.concat(comp.getRenderables());
        }, []);

        if (this._frame) {
            this._frame.addRenderables(renderables);
        }

        this._allComponents.forEach(comp => {
            comp[onAddComp](components);
        });
        this._allComponents = this._allComponents.concat(components);

        let on = components.filter(c => c.isOn);

        if (this._frame && this._frame.isOpen) {
            on.forEach(c => {
                c[onOpen]();
            });
        }

        return on;
    }

    getRenderables() {
        let renderables = [];
        this._allComponents.forEach(c => {
            renderables = renderables.concat(c.getRenderables());
        });
        return renderables;
    }

    [onAddComp](c) {
        this.onAddComponents(c);
        this._allComponents.forEach(comp => {
            comp[onAddComp](c);
        });
    }

    [onOpen]() {
        this.onOpen();
        this._allComponents.forEach(c => {
            c[onOpen]();
        });
    }

    [onKeyDown](keys) {
        if (this.isOn) {
            this.onKeyDown(keys);
            this._allComponents.forEach(c => {
                c[onKeyDown](keys);
            });
        }
    }

    [onKeyUp](keys) {
        if (this.isOn) {
            this.onKeyUp(keys);
            this._allComponents.forEach(c => {
                c[onKeyUp](keys);
            });
        }
    }

    [onMouseDown](evt) {
        if (this.isOn) {
            this.onMouseDown(evt);
            this._allComponents.forEach(c => {
                c[onMouseDown](evt);
            });
        }
    }
    
    [onMouseUp](evt) {
        if (this.isOn) {
            this.onMouseUp(evt);
            this._allComponents.forEach(c => {
                c[onMouseUp](evt);
            });
        }
    }

    [onMouseMove](evt) {
        if (this.isOn) {
            this.onMouseMove(evt);
            this._allComponents.forEach(c => {
                c[onMouseMove](evt);
            });
        }
    }

    [onClick](evt) {
        if (this.isOn) {
            this.onClick(evt);
            this._allComponents.forEach(c => {
                c[onClick](evt);
            });
        }
    }

    [onFocus]() {
        this.onFocus();
        this._allComponents.forEach(c => {
            c[onFocus]();
        });
    }
    
    [onBlur]() {
        this.onBlur();
        this._allComponents.forEach(c => {
            c[onBlur]();
        });
    }
    
    [onResize]() {
        this.onResize();
        this._allComponents.forEach(c => {
            c[onResize]();
        });
    }

    [onSwitchOn](comp) {
        this.onSwitchOn(comp);
        this._allComponents.forEach(c => {
            c[onSwitchOn](comp);
        });
    }

    [onSwitchOff](comp) {
        this.onSwitchOff(comp);
        this._allComponents.forEach(c => {
            c[onSwitchOff](comp);
        });
    }

    [onTouchStart](touches) {
        if (this.isOn) {
            this.onTouchStart(touches);
            this._allComponents.forEach(c => {
                c[onTouchStart](touches);
            });
        }
    }

    [onTouchMove](touches) {
        if (this.isOn) {
            this.onTouchMove(touches);
            this._allComponents.forEach(c => {
                c[onTouchMove](touches);
            });
        }
    }

    [onTouchEnd](touches) {
        if (this.isOn) {
            this.onTouchEnd(touches);
            this._allComponents.forEach(c => {
                c[onTouchEnd](touches);
            });
        }
    }

    [onTouchCancel](touches) {
        if (this.isOn) {
            this.onTouchCancel(touches);
            this._allComponents.forEach(c => {
                c[onTouchCancel](touches);
            });
        }
    }

    [onToggleScreen](mode) {
        this.onToggleScreen(mode);
        this._allComponents.forEach(c => {
            c[onToggleScreen](mode);
        });
    }
}

export class Frame extends FrameComponent {
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
        this._centerX = null;
        this._centerY = null;
        this._priority = 1;

        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
        this._postRender = this._postRender.bind(this);

        this._worker.addEventListener('message', this._postRender);

        /**
         * @type {Array<FrameComponent>}
         */
        this._onComponents = [];

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
                x: null,
                y: null,
                dx: 0,
                dy: 0,
                isMove: false
            },
            click: {
                x: null,
                y: null,
                buttons: 0,
                isClick: false
            }
        };

        this._touches = {
            start: [],
            move: [],
            end: [],
            cancel: []
        };

        this._keysDown = {};
        this._keysUp = {};
        
        this._block = false;

        this._fc.addEventListener('switchOff', e => {
            if (this._block) return;
            const trgt = e.detail.target;
            queueMicrotask(() => {
                if (trgt instanceof FrameRenderableComponent) {
                    this._renderableComp.delete(this._renderableComp.find(o => o.component == trgt));

                    if (trgt.parentElement == this._fc) {
                        this._onComponents.delete(trgt);
                    }
                    
                    trgt.parent[onSwitchOff](trgt);
                } else if (trgt instanceof FrameComponent && trgt.parentElement == this._fc) {
                    this._onComponents.delete(trgt);

                    trgt.parent[onSwitchOff](trgt);
                }
            });
        });

        this._fc.addEventListener('switchOn', e => {
            if (this._block) return;
            const trgt = e.detail.target;
            queueMicrotask(() => {
                if (trgt instanceof FrameRenderableComponent) {
                    this.addRenderables([trgt]);

                    if (trgt.parentElement == this._fc) {
                        this._onComponents.push(trgt);
                        this._onComponents.sort(this._compSort);
                    }
                    
                    trgt.parent[onSwitchOn](trgt);
                } else if (trgt instanceof FrameComponent && trgt.parentElement == this._fc) {
                    this._onComponents.push(trgt);
                    this._onComponents.sort(this._compSort);

                    trgt.parent[onSwitchOn](trgt);
                }
            });
        });

        this._frame = this;
        this._cont = this._fc;

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

    get centerX() {
        return this._centerX;
    }

    get centerY() {
        return this._centerY;
    }

    get priority() {
        return this._priority;
    }

    get isOpen() {
        return this._isOpened;
    }
    
    /**
     * Adds components
     * @param {Array<FrameComponent>} components 
     */
    addComponents(components) {
        queueMicrotask(() => {
            this._onComponents = this._onComponents.concat(super.addComponents(components));
            this._onComponents.sort(this._compSort);
        });
    }

    /**
     * @param {Array<FrameRenderableComponent>} renderables
     */
    addRenderables(renderables) {
        this._renderableComp = this._renderableComp.concat(
            renderables.map(c => {
                this._worker.postMessage({
                    method: 'addRender',
                    id: renderId,
                    render: getFunctionBody(c.render),
                    initRender: getFunctionBody(c.initRender)
                });

                return {
                    id: renderId++,
                    component: c
                };
            })
        );
        this._renderableComp.sort(this._rendCompSort);
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
            this._centerX = width / 2;
            this._centerY = height / 2;
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
        this._centerX = this._width / 2;
        this._centerY = this._height / 2;

        this._onComponents.forEach(c => c.onResize());
        console.log('resize');
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

        if (this._touches.start.length) {
            this._onComponents.forEach(c => {
                c[onTouchStart](this._touches.start);
            });

            this._touches.start = [];
        }

        if (this._touches.move.length) {
            this._onComponents.forEach(c => {
                c[onTouchMove](this._touches.move);
            });

            this._touches.move = [];
        }

        if (this._touches.end.length) {
            this._onComponents.forEach(c => {
                c[onTouchEnd](this._touches.end);
            });

            this._touches.end = [];
        }

        if (this._touches.cancel.length) {
            this._onComponents.forEach(c => {
                c[onTouchCancel](this._touches.cancel);
            });

            this._touches.cancel = [];
        }

        if (this._mouse.down.isDown) {
            this._onComponents.forEach(c => {
                c[onMouseDown](this._mouse.down);
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
                c[onMouseMove](this._mouse.move);
            });

            this._mouse.move = {
                x: null,
                y: null,
                dx: 0,
                dy: 0,
                buttons: 0,
                isMove: false
            };
        }

        if (this._mouse.up.isUp) {
            this._onComponents.forEach(c => {
                c[onMouseUp](this._mouse.up);
            });

            this._mouse.up = {
                x: null,
                y: null,
                buttons: 0,
                isUp: false
            };
        }

        if (this._mouse.click.isClick) {
            this._onComponents.forEach(c => {
                c[onClick](this._mouse.click);
            });

            this._mouse.click = {
                x: null,
                y: null,
                buttons: 0,
                isClick: false
            };
        }

        if (!isEmpty(this._keysDown)) {
            this._onComponents.forEach(c => {
                c[onKeyDown](this._keysDown);
            });

            this._keysDown = {};
        }
        
        if (!isEmpty(this._keysUp)) {
            this._onComponents.forEach(c => {
                c[onKeyUp](this._keysUp);
            });

            this._keysUp = {};
        }

        this._onComponents.forEach(c => c[tick]());

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
            this._ctx.save();
            renderData.component.postRender(this._ctx, e.data[renderData.id]);
            this._ctx.restore();
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

    mouseMove(x, y, buttons, e) {
        const moveData = this._mouse.move;
        moveData.isMove = true;
        moveData.x = x;
        moveData.y = y;
        moveData.dx += e.movementX;
        moveData.dy += e.movementY;
        moveData.buttons = buttons;
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

    click(x, y, buttons) {
        const cD = this._mouse.click;
        cD.isClick = true;
        cD.x = x;
        cD.y = y;
        cD.buttons = buttons;
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
                    this._allComponents.forEach(c => {
                        c[onToggleScreen](false);
                    });
                    return 'screenOff';
                });
            } else if (this._isFullscreened) {
                document.exitPointerLock();
                this._isFullscreened = false;
                this._allComponents.forEach(c => {
                    c[onToggleScreen](false);
                });
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
                    this._allComponents.forEach(c => {
                        c[onToggleScreen](true);
                    });
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
            },
            click: {
                x: 0,
                y: 0,
                isClick: false
            }
        };
        this._touches = {
            start: [],
            move: [],
            end: [],
            cancel: []
        }
    }

    /*Адаптировать под 1 функцию, не вызывать mouseDown, *Up, *Move, click*/
    handleMouse(type, x, y, buttons, evt) {
        const {left, top} = this._canvas.getBoundingClientRect();
        this[type](x - left, y - top, buttons, evt);
    }

    handleTouches(touches, name) {
        const {left, top} = this._canvas.getBoundingClientRect();
        this._touches[name].push(...touches.map(({identifier, clientX, clientY}) => {
            return {
                identifier,
                x: clientX - left,
                y: clientY - top
            };
        }));
    }
}

customElements.define('frame-element', Frame);