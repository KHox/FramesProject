import { FrameComponent, FrameRenderableComponent } from "../../FrameSystem/index.js";
import { Collider, isNumeric, Transform, Vec2 } from "../../Lib/index.js";

const onCameraChanged = Symbol('onCameraChanged');

export class Object2D extends FrameComponent {
    constructor(src) {
        super();
        this._name = 'Unknown object';
        this._ho = this._wo = this._height = this._width = null;
        this._loads = [];

        this._image = new Image();
        this._image.onload = () => {
            if (this._width == null) {
                this.width = this._image.width;
            }
            
            if (this._height == null) {
                this.height = this._image.height;
            }
            
            this._loads.forEach(f => f(this));
        }

        if (src) {
            this._image.src = src;
        }

        this._currImage = this._image;

        this._outlineColor = '';
        this._outlineWidth = 5;
        this._outlineHeight = 5;
        
        this._transform = new Transform();
    }

    get transform() {
        return this._transform;
    }

    set transform(v) {
        this._transform.set(...v.valueOf());
    }

    get width() {
        return this._width;
    }

    set width(v) {
        if (isNumeric(v)) {
            this._width = v;
            this._calcVolumes('width');
        }
    }

    get widthOffset() {
        return this._wo;
    }
    
    get height() {
        return this._height;
    }
    
    set height(v) {
        if (isNumeric(v)) {
            this._height = v;
            this._calcVolumes('height');
        }
    }

    get heightOffset() {
        return this._ho;
    }

    get outlineColor() {
        return this._outlineColor;
    }

    set outlineColor(v) {
        this._outlineColor = v;
        this._calcVolumes('color');
    }

    get outlineWidth() {
        return this._outlineWidth;
    }

    set outlineWidth(v) {
        if (isNumeric(v)) {
            this._outlineWidth = v;
            this._calcVolumes('lineWidth');
        }
    }


    get outlineHeight() {
        return this._outlineHeight;
    }

    set outlineHeight(v) {
        if (isNumeric(v)) {
            this._outlineHeight = v;
            this._calcVolumes('lineHeight');
        }
    }

    get image() {
        return this._currImage;
    }

    get src() {
        return this._image.src;
    }

    set src(v) {
        this._image.src = v;
    }

    set onload(func) {
        if (func instanceof Function) {
            this._loads.push(func);
        }
    }

    get name() {
        return this._name;
    }

    set name(n) {
        if (this._name !== n) {
            this._name = n;
            this.dispatchEvent(new CustomEvent('changeName', {
                bubbles: true,
                cancelable: true
            }));
        }
    }

    _calcVolumes(v) {
        if (this._outlineColor) {
            let canv = document.createElement('canvas');
            let ctx = canv.getContext('2d');
            let w = this._width + 2 * this._outlineWidth;
            let h = this._height + 2 * this._outlineHeight;

            canv.width = w;
            canv.height = h;

            ctx.fillStyle = this._outlineColor;
            ctx.fillRect(0, 0, w, h);

            ctx.globalCompositeOperation = 'destination-in';

            ctx.drawImage(this._image, 0, 0, w, h);

            ctx.globalCompositeOperation = 'source-over';

            ctx.drawImage(this._image, this._outlineWidth, this._outlineHeight, this._width, this._height);

            this._currImage = canv;
            this._ho = h;
            this._wo = w;
        } else {
            this._currImage = this._image;
            this._ho = this._height;
            this._wo = this._width;
        }
    }

    static get observedAttributes() {
        return ['src', 'x', 'y', 'rot', 'width', 'height', 'outline-color', 'outline-width', 'outline-height', 'name'].concat(super.observedAttributes);
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case 'src':
                this._image.src = newValue;
                break;
            case 'x':
                this._transform.position.x = +newValue;
                break;
            case 'y':
                this._transform.position.y = +newValue;
                break;
            case 'rot':
                this._transform.rotation = +newValue;
                break;
            case 'width':
                this.width = +newValue;
                break;
            case 'height':
                this.height = +newValue;
                break;
            case 'outline-color':
                this._outline.color = newValue;
                break;
            case 'outline-width':
                this._outline.width = +newValue;
                break;
            case 'outline-height':
                this._outline.height = +newValue;
                break;
            case 'name':
                this._name = newValue;
                break;
        }
    }

    [onCameraChanged](oldPos) {
        this._allComponents.forEach(c => {
            if (c.onCameraChanged instanceof Function) {
                c.onCameraChanged(oldPos);
            }
        })
    }
}

customElements.define('object-2d', Object2D);

export class DrawingMapSystem extends FrameRenderableComponent {
    constructor() {
        super();
        this._dmsCanvas = document.createElement('canvas');
        this._dmsCtx = this._dmsCanvas.getContext('2d');

        this._cameraTransform = new Transform();
        this._cameraTransform.setCallback((p) => {
            this._objects.forEach(o => {
                o[onCameraChanged](p);
            });
        });
        
        /**
         * @type {Array<Object2D>}
         */
        this._objects = [];

        this._forLiveMap = new Map();
        
        this.addEventListener('changeName', e => {
            if (e.target instanceof Object2D) {
                if (this._forLiveMap.has(e.target.name)) {
                    this._forLiveMap.get(e.target.name).push(e.target);
                }
            }
        });

        this._blockAdding = false;

        this.addEventListener('switchOn', e => {
            if (!this._blockAdding && e.detail.target.parentElement == this) {
                this._objects.push(e.detail.target);
            }
        });

        this.addEventListener('switchOff', e => {
            if (!this._blockAdding && e.detail.target.parentElement == this) {
                this._objects.delete(e.detail.target);
            }
        });
    }

    get cameraTransform() {
        return this._cameraTransform;
    }
    
    onOpen() {
        this._ctx = this._frame.ctx;
        this._objects.push(...Array.from(this.children).filter(c => c instanceof Object2D));
        this._center = new Vec2(this._frame.centerX, this._frame.centerY);
    }

    postRender() {
        this._objects.forEach(o2d => this.drawObject2d(o2d));
    }

    /**
     * @param {Object2D} o2d 
     */
    drawObject2d(o2d) {
        let w = o2d.widthOffset;
        let h = o2d.heightOffset;
        
        let rotM = Transform.getRotationMatrix(o2d.transform.rotation + this._cameraTransform.rotation);
        let pos = this.worldToCameraMatrix(o2d.transform.position);

        this._ctx.setTransform(...rotM, pos.x, pos.y);

        this._ctx.translate(-w / 2, -h / 2);

        this._ctx.drawImage(o2d.image, 0, 0, w, h);
    }
    
    getObjectsByName(name, isLive) {
        if (this._forLiveMap.has(name)) {
            return this._forLiveMap.get(name);
        } else {
            let arr = this._objects.filter(o => o.name == name);
            if (isLive) {
                this._forLiveMap.set(name, arr);
            }
            return arr;
        }
    }

    drawLine(p1, p2, color) {
        p1 = this.worldToCameraMatrix(p1);
        p2 = this.worldToCameraMatrix(p2);
        this._ctx.beginPath();
        this._ctx.strokeStyle = color;
        this._ctx.moveTo(p1.x, p1.y);
        this._ctx.lineTo(p2.x, p2.y);
        this._ctx.stroke();
    }

    drawPoint(p1, color, isScreen, radius = 2) {
        if (!isScreen) {
            p1 = this.worldToCameraMatrix(p1);
        }
        this._ctx.beginPath();
        this._ctx.fillStyle = color;
        this._ctx.arc(p1.x, p1.y, radius, 0, 2 * Math.PI);
        this._ctx.fill();
    }

    /**
     * @param {Vec2} point
     */
    worldToCameraMatrix(point) {
        return point.minus(this._cameraTransform.position).rotateByMatrix(this._cameraTransform.rotationMatrix).plus(this._center);
    }
    
    /**
     * @param {Vec2} point
     */
    screenToWorldMatrix(point) {
        return this._cameraTransform.position.plus(point.minus(this._center).rotateByMatrix(Transform.reverseMatrix(this._cameraTransform.rotationMatrix)));
    }

    onResize() {
        this._center = new Vec2(this._frame.centerX, this._frame.centerY);
    }

    addComponents(os2d) {
        this._blockAdding = true;
        super.addComponents(os2d);
        this._blockAdding = false;

        let filtered = os2d.filter(o2d => {
            if (o2d instanceof Object2D) {
                if (this._forLiveMap.has(o2d.name)) {
                    this._forLiveMap.get(o2d.name).push(o2d);
                }
                return o2d.isOn;
            }
        });
        this._objects = this._objects.concat(filtered);
    }
}

customElements.define('drawing-map-system', DrawingMapSystem);