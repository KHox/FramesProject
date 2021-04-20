import { FrameComponent, FrameRenderableComponent } from "../../FrameSystem/index.js";
import { isNumeric, Transform, Vec2 } from "../../Lib/index.js";

let objId = 0;

export class Object2D extends FrameComponent {
    constructor(src) {
        super();
        this._name = 'Unknown object';
        this._ho = this._wo = this._height = this._width = null;

        this._image = new Image();
        this._image.onload = () => {
            if (this._width == null) {
                this.width = this._image.width;
            }
            
            if (this._height == null) {
                this.height = this._image.height;
            }
            this.dispatchEvent(new CustomEvent('load', {
                detail: this
            }));
        }

        this._image.onerror = e => {
            this.dispatchEvent(new CustomEvent('error', {
                detail: e
            }));
        }

        if (src) {
            this._image.src = src;
        }

        this._currImage = this._image;

        this._outlineColor = '';
        this._outlineWidth = 5;
        this._outlineHeight = 5;

        this._objId = objId++;
        
        this._transform = new Transform();
    }

    get objId() {
        return this._objId;
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

    set image(v) {
        this._image = v;
        this._width = v.width;
        this._height = v.height;
        this._calcVolumes();
    }

    get src() {
        return this._image.src;
    }

    set src(v) {
        this._image.src = v;
    }

    set onerror(func) {
        if (func instanceof Function) {
            this.addEventListener('error', e => func(e.detail));
        }
    }

    set onload(func) {
        if (func instanceof Function) {
            this.addEventListener('load', e => func(e.detail));
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
            const canv = document.createElement('canvas');
            const ctx = canv.getContext('2d');

            const iw = this._image.width;
            const ih = this._image.height;

            const w = iw + 2 * this._outlineWidth;
            const h = ih + 2 * this._outlineHeight;

            canv.width = w;
            canv.height = h;

            ctx.fillStyle = this._outlineColor;
            ctx.fillRect(0, 0, w, h);

            ctx.globalCompositeOperation = 'destination-in';

            ctx.drawImage(this._image, 0, 0, w, h);

            ctx.globalCompositeOperation = 'source-over';

            ctx.drawImage(this._image, this._outlineWidth, this._outlineHeight, iw, ih);

            this._currImage = canv;
            this._ho = this._height + 2 * this._outlineHeight * this._height / ih;
            this._wo = this._width + 2 * this._outlineWidth * this._width / iw;
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

    toJSON() {
        return {
            objId: this.objId,
            width: this.width,
            height: this.height,
            widthOffset: this.widthOffset,
            heightOffset: this.heightOffset,
            transform: this._transform.toJSON(),
            radius: new Vec2(this.widthOffset, this.heightOffset).magnitude / 2
        }
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
            this.dispatchEvent(new CustomEvent('cameraChanged', {
                detail: {
                    position: p
                }
            }))
        });
        
        /**
         * @type {Array<Object2D>}
         */
        this._objects = [];
        this._objectsData = {}

        this._forLiveMap = new Map();

        this._renderedCount = 0;
        
        this.addEventListener('changeName', e => {
            if (e.target instanceof Object2D) {
                if (this._forLiveMap.has(e.target.name)) {
                    this._forLiveMap.get(e.target.name).push(e.target);
                }
            }
        });

        this._blockAdding = false;

        this.addEventListener('switchOn', e => {
            if (!this._blockAdding && e.detail.target instanceof Object2D && e.detail.target.parentElement == this) {
                this._objects.push(e.detail.target);
                this._objectsData[e.detail.target.objId] = e.detail.target;
            }
        });

        this.addEventListener('switchOff', e => {
            console.log(e.detail.target);
            if (!this._blockAdding && e.detail.target.parentElement == this) {
                this._objects.delete(e.detail.target);
                this._objectsData[e.detail.target.objId] = null;
            }
        });

        this._fovMul = 1;
    }

    get fov() {
        return this._fovMul;
    }

    set fov(v) {
        if (isNumeric(v) && v >= 0) {
            this._fovMul = v;
        }
    }

    get cameraTransform() {
        return this._cameraTransform;
    }

    get renderedCount() {
        return this._renderedCount;
    }
    
    onOpen() {
        this._ctx = this._frame.ctx;
        this._objects.push(...Array.from(this.children).filter(c => c instanceof Object2D));
        this._center = new Vec2(this._frame.centerX, this._frame.centerY);
    }

    initRender() {
        return {
            compirer(v, elem) {
                return v - elem.z;
            }
        }
    }

    get imports() {
        return ['../Lib/classes/Transform.js', '../Lib/classes/Vec2.js', '../Lib/ArrayLib.js'];
    }

    preRender() {
        return {
            objectTransforms: this._objects.map(o => o.toJSON()),
            camera: this._cameraTransform.toJSON(),
            center: this._center.toJSON(),
            cameraRadius: this._center.magnitude,
            mul: this._fovMul
        };
    }

    /**
     * @param {object} data
     * @param {Array<object>} data.objectTransforms
     * @param {object} data.camera
     */
    render(data) {
        const result = {
            drawables: []
        };

        if (data.objectTransforms.length) {
            const ct = new Transform(data.camera.x, data.camera.y, data.camera.z, data.camera.rotation);
            const width = data.center.x * 2;

            data.objectTransforms.forEach(o2d => {
                const z = o2d.transform.z;
                const dz = ct.position.z - z;
                const scaleProjected = data.mul * width / (data.mul * width + dz);
                
                if (scaleProjected > 0) {
                    const pos = ct.translateFromWorld(new Vec2(o2d.transform.x, o2d.transform.y)).mul(scaleProjected);
                    if (pos.magnitude <= data.cameraRadius + o2d.radius * scaleProjected) {
                        const rotM = Transform.getRotationMatrix(o2d.transform.rotation + ct.rotation);

                        const ind = result.drawables.binarySearch(z, this.compirer);

                        result.drawables.splice(ind, 0, {
                            z,
                            id: o2d.objId,
                            scale: scaleProjected,
                            pos: pos.plus(data.center).toJSON(),
                            rotM
                        });
                    }
                }
                //const rt = new Vec2(w, h).rotateByMatrix(rotM);
                //const rb = new Vec2(w, -h).rotateByMatrix(rotM);
                
                //const maxX = Math.max(Math.abs(rt.x), Math.abs(rb.x));
                //const maxY = Math.max(Math.abs(rt.y), Math.abs(rb.y));
            });//.filter(od => od.needDraw);
        }

        return result;
    }

    postRender(_, data) {
        if (!data) return;
        this._renderedCount = data.drawables.length;
        data.drawables.forEach(od => {
            this.renderObject2d(this._objectsData[od.id], od.pos, od.rotM, od.scale);
        //    this.drawObject2d(this._objectsData[od.id]);
        });
        //this._objects.forEach(o2d => this.drawObject2d(o2d));
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

    /**
     * @param {Object2D} o2d
     */
    renderObject2d(o2d, pos, rotM, scale) {

        pos = new Vec2(pos.x, pos.y);
        /*
        let dz = this._cameraTransform.position.z - o2d.transform.position.z;

        let scaleProjected = this._fovMul * width / (this._fovMul * width + dz);
        let x = (pos.x * scaleProjected) + this._center.x;
        let y = (pos.y * scaleProjected) + this._center.y;
        */
        this._ctx.setTransform(...rotM, pos.x, pos.y);

        //this._ctx.scale(0.5, 0.5);
        
        this._ctx.translate(-o2d.widthOffset / 2 * scale, -o2d.heightOffset / 2 * scale);

        this._ctx.drawImage(o2d.image, 0, 0, o2d.widthOffset * scale, o2d.heightOffset * scale);
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

    drawPoint(p1, color, isScreen, radius = 5) {
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
        return this._cameraTransform.translateFromWorld(point).plus(this._center);
    }
    
    /**
     * @param {Vec2} point
     */
    screenToWorldMatrix(point) {
        return this._cameraTransform.translateToWorld(point.minus(this._center));
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
        filtered.forEach(o2d => {
            this._objectsData[o2d.objId] = o2d;
        });
        this._objects = this._objects.concat(filtered);
    }

    attributeChangedCallback(name, oldV, newV) {
        super.attributeChangedCallback(name, oldV, newV);
        console.log(name, oldV, newV);
        if (isNumeric(newV)) {
            switch (name) {
                case 'camera-x':
                    this._cameraTransform.position.x = +newV;
                    break;
                case 'camera-y':
                    this._cameraTransform.position.y = +newV;
                    break;
                case 'camera-z':
                    this._cameraTransform.position.z = +newV;
                    break;
            }
        }
    }

    static get observedAttributes() {
        return super.observedAttributes.concat('camera-x', 'camera-y', 'camera-z');
    }
}

customElements.define('drawing-map-system', DrawingMapSystem);