import {isNumeric, isEmpty} from '../Lib/index.js';

let hasFullscreened = false;

let isStoped = true;
let isUpdated = false;
let fpsId, upsId;
/**
 * @type {Array<Frame>}
 */
const frames = [];

/**
 * @type {Frame}
 */
let activeFrame;

function updateFunc() {
    if (isStoped) {
        clearInterval(upsId);
        cancelAnimationFrame(fpsId);
    } else {
        let needStop = true;
        for (const frame of frames) {
            if (frame.isActive) {
                frame.tick();
                needStop = false;
            }
        }

        if (needStop) {
            isStoped = true;
        } else {
            isUpdated = true;
        }
    }
}

function startFrames() {
    fpsId = requestAnimationFrame(startFrames);
    if (isUpdated) {
        if (hasFullscreened && activeFrame.isActive) {
            activeFrame.preRenderFrame();
        } else {
            for (const frame of frames) {
                if (frame.isActive) {
                    frame.preRenderFrame();
                }
            }
        }
        isUpdated = false;
    }
}

class initableElement extends HTMLElement {
    get isInit() {
        return this._isInit;
    }

    constructor() {
        super();
        this._isInit = false;
    }

    connectedCallback() {
        if (!this._isInit) {
            this.init();
            this._isInit = true;
        }
    }

    init() {}
}

class SwitchableElement extends initableElement {
    get isActive() {
        return this._isActive;
    }

    constructor() {
        super();
        this._isActive = false;
    }

    init() {
        if (this.hasAttribute('deactivated')) {
            this._isActive = false;
            this.removeAttribute('deactivated');
        } else {
            this._isActive = true;
        }
    }

    switch() {
        this._isActive = !this._isActive;
    }
    
    switchOff() {
        this._isActive = false;
    }

    switchOn() {
        this._isActive = true;
    }
}

class Frame extends SwitchableElement {
    /**
     * @param {FrameComponent} component 
     */
    addComponent(component) {
        if (component instanceof FrameComponent) {
            if (this._isInit) {
                if (this._components.includes(component)) {
                    throw new TypeError('Component already added');
                } else {
                    this._components.push(component);
                    if (component instanceof RenderableFrameComponent) {
                        let index = this._preRenderData.length;
                        this._renderableComponents.push({
                            component,
                            index
                        });
                        this._renderableComponents.sort((a, b) => a.component.priority - b.component.priority);

                        let renderBody = '';
                        if (component.render instanceof Function) {
                            renderBody = component.render.getFunctionBody();
                        }

                        let initRenderBody = '';
                        if (component.initRender instanceof Function) {
                            initRenderBody = component.initRender.getFunctionBody();
                        }

                        this._worker.postMessage({
                            type: 'addComponent',
                            renderBody,
                            initRenderBody,
                            index
                        });

                        if (component.preRender instanceof Function) {
                            this._preRenderData.push({});
                        } else {
                            this._preRenderData.push(component.preRender);
                        }
                    }
                }
            } else {
                throw new TypeError('Frame isn\'t init');
            }
        } else {
            throw new TypeError('Expected FrameComponent');
        }
    }

    addElement(html) {
        if (html instanceof HTMLElement) {
            this._shadow.append(html);
        } else {
            this._shadow.insertAdjacentHTML('beforeend', html);
        }
    }

    /**
     * @returns {CanvasRenderingContext2D}
     */
    get ctx() {
        return this._ctx;
    }

    get height() {
        return this._height;
    }

    get width() {
        return this._width;
    }

    get isFullscreened() {
        return this._isFullscreened;
    }

    init() {
        this._shadow = this.attachShadow({mode: 'closed'});
        this._shadow.innerHTML = `<link rel="stylesheet" href="styles/in-game-styles.css">
        <div class="frame-container"><canvas class="in-frame-canvas"></canvas></div>`;

        this._shadow.querySelector('link').onload = () => {
            this.resize();
            super.init();

            Frame.addFrame(this);
        };

        this._fixedVolumes = this.hasAttribute('fixed-volumes');
        
        this._frameContainer = this._shadow.querySelector('.frame-container');
        this._screen = this._frameContainer.querySelector('.in-frame-canvas');
        this._ctx = this._screen.getContext('2d');
        this._ratio = this._getCorrectRatio(this.getAttribute('screen-ratio'));

        this._frameContainer.requestFullScreen = this._frameContainer.requestFullscreen || this._frameContainer.webkitRequestFullScreen || this._frameContainer.mozRequestFullScreen;
        this._frameContainer.requestPointerLock = this._frameContainer.requestPointerLock || this._frameContainer.mozRequestPointerLock;

        this.postRender = this.postRender.bind(this);
        
        this._worker = new Worker('./scripts/frameComponentSystem/FrameWorker.js');
        this._worker.postMessage({type: 'main'});
        this._worker.addEventListener('message', this.postRender);
        
        /**
         * @type {Array<FrameComponent>}
         */
        this._components = [];
        /**
         * @type {Array<RenderableFrameComponent>}
         */
        this._renderableComponents = [];
        this._preRenderData = [];

        this._downedKeys = {};
        this._uppedKeys = {};

        this._mouseData = {
            moveX: 0,
            moveY: 0,
            isMove: false
        }
        
        let pn = performance.now();
        this._time = {
            lastFrame: null,
            lastTick: pn,
            currentFrame: pn,
            currentTick: null,
            deltaFrame: null,
            deltaTick: null
        };

        this._isFullscreened = false;
    }

    keyDown(key) {
        this._downedKeys[key] = true;
    }

    keyUp(key) {
        this._uppedKeys[key] = true;
    }

    mouseMove(x, y) {
        this._mouseData.moveX += x;
        this._mouseData.moveY += y;
        this._mouseData.isMove = true;
    }

    removeComponent(component) {
        if (component instanceof RenderableFrameComponent) {
            let ind = this._renderableComponents.indexOf(component);
            if (ind != -1) {
                this._renderableComponents.splice(ind, 1);
                this._preRenderData.slice(ind, 1);
                this._worker.postMessage({
                    type: 'removeComponent',
                    index: ind
                });
            }
        }
        let ind = this._components.indexOf(component);
        if (ind != -1) {
            this._components.splice(ind, 1);
            return true;
        }
        return false;
    }

    preRenderFrame() {
        this._time.lastFrame = this._time.currentFrame;
        this._time.currentFrame = performance.now();
        this._time.deltaFrame = this._time.currentFrame - this._time.lastFrame;

        for (let i = 0; i < this._renderableComponents.length; i++) {
            const component = this._renderableComponents[i].component;
            const index = this._renderableComponents[i].index;
            if (component.isActive) {
                if (component.preRender instanceof Function) {
                    this._preRenderData[index] = component.preRender();
                }
            } else {
                this._preRenderData[index] = undefined;
            }
        }

        this._worker.postMessage({
            type: 'render',
            renderData: this._preRenderData
        });
    }

    postRender({data}) {
        this._ctx.clearRect(0, 0, this._width, this._height);
        this._ctx.textBaseline = 'top';
        this._ctx.font = '15px sans-serif';

        for (let i = 0; i < this._renderableComponents.length; i++) {
            const componentData = this._renderableComponents[i];
            const component = componentData.component;
            if (component.isActive && component.postRender instanceof Function) {
                component.postRender(data[componentData.index]);
            }
        }
    }

    get time() {
        return this._time;
    }

    tick() {
        this._time.currentTick = performance.now();
        this._time.deltaTick = this._time.currentTick - this._time.lastTick;

        if (!isEmpty(this._downedKeys)) {
            for (const component of this._components) {
                if (component.isActive) component.onKeyDown(this._downedKeys);
            }
            this._downedKeys = {};
        }

        if (!isEmpty(this._uppedKeys)) {
            for (const component of this._components) {
                if (component.isActive) component.onKeyUp(this._uppedKeys);
            }
            this._uppedKeys = {};
        }

        if (this._mouseData.isMove) {
            for (const component of this._components) {
                if (component.isActive) component.onMouseMove(this._mouseData.moveX, this._mouseData.moveY);
            }
            this._mouseData = {
                moveX: 0,
                moveY: 0,
                isMove: false
            };
        }

        for (const component of this._components) {
            if (component.isActive) component.tick();
        }

        this._time.lastTick = this._time.currentTick;
    }
    
    resize() {
        if (!(this._isFullscreened && this._fixedVolumes)) {
        this._screen.height = this._height = Math.round(this._frameContainer.offsetHeight * this._ratio);
        this._screen.width = this._width = Math.round(this._frameContainer.offsetWidth * this._ratio);
        }
    }

    
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'screen-ratio' && this._isInit) {
            this._ratio = this._getCorrectRatio(newValue);
            this.resize();
        }
    }
    
    _getCorrectRatio(value) {
        value = +value;
        
        if (isNumeric(value)) {
            if (value > 1 || value <= 0) {
                return 1;
            }
            return value;
        } else {
            return 1;
        }
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
            document.exitPointerLock();
        }

        this._isFullscreened = !this._isFullscreened;

        if (this._isFullscreened) {
            this._frameContainer.requestFullscreen();
            this._frameContainer.requestPointerLock();
        }
    }
    
    static get observedAttributes() {
        return ['screen-ratio'];
    }
    
    static addFrame(frame) {
        if (frame instanceof Frame) {
            if (frames.includes(frame)) {
                throw new TypeError('Already added');
            } else {
                frames.push(frame);
                if (isStoped && frame.isActive) {
                    upsId = setInterval(updateFunc);
                    fpsId = requestAnimationFrame(startFrames);
                    isStoped = false;
                }

                activeFrame = frame;
            }
        } else {
            throw new TypeError('Expected Frame');
        }
    }
}

export class FrameComponent extends SwitchableElement {
    constructor() {
        super();
        this._frame = null;
    }

    connectedCallback() {
        if (this._frame instanceof Frame) {
            this._frame.removeComponent(this);
        }
        
        let parent = this.parentElement;
        if (parent instanceof Frame) {
            this._frame = parent;
            parent.addComponent(this);
            super.connectedCallback();
        } else {
            this._frame = null;
        }
    }

    tick() {}
    onKeyDown(keys) {}
    onKeyUp(keys) {}
    onMouseMove(x, y) {}
}

export class RenderableFrameComponent extends FrameComponent {
    constructor() {
        super();
        this._priority = null;
    }

    init() {
        if (!isNumeric(this._priority)) {
            this._priority = this.getAttribute('priority');
            if (!isNumeric(this._priority)) {
                this._priority = 1;
            }
        }
        super.init();
    }

    get priority() {
        return this._priority;
    }

    initRender() {}
    preRender() {}
    render() {}
    postRender() {}
}

customElements.define('frame-element', Frame);

addEventListener('resize', () => {
    frames.forEach(frame => {
        frame.resize();
    });
});

document.addEventListener('keydown', e => {
    if (e.repeat) return;
    activeFrame.keyDown(e.code);
    if (e.altKey && e.code == 'Enter') {
        activeFrame.toggleFullscreen();
    }
});

document.addEventListener('keyup', e => {
    activeFrame.keyUp(e.code);
});

document.addEventListener('mousemove', e => {
    if (activeFrame) activeFrame.mouseMove(e.movementX, e.movementY);
});

document.addEventListener('click', e => {
    const frame = e.target.closest('frame-element');
    if (frame) {
        activeFrame = frame;
    }
});

document.addEventListener('dblclick', e => {
    /**
     * @type {Frame}
     */
    const frame = e.target.closest('frame-element');
    if (frame) {
        activeFrame = frame;
        frame.toggleFullscreen();
    }
});

document.addEventListener('fullscreenchange', e => {
    if (document.fullscreenElement) {
        hasFullscreened = true;
    } else {
        hasFullscreened = false;
        frames.forEach(frame => frame._isFullscreened = false);
    }
});