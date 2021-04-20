import { FrameRenderableComponent } from "../../FrameSystem/index.js";
import { Vec3Set } from "../../Lib/index.js";

export class CopyCoords extends FrameRenderableComponent {
    onOpen() {
        this._btnWidth = 300;
        this._btnHeight = 100;

        this._state = null;
        this._bgColor = 'blue';
        this._text = 'Copy Coordinates';

        this._bottom = 40;
        this._x = 40;
        this._r = 8;
        this.onResize();
        this._ctx = this._frame.ctx;
        /**
         * @type {Vec3Set}
         */
        this._cameraPos = this._frame.getComponents('DrawingMapSystem')[0]?.cameraTransform.position;
    }
    
    onResize() {
        this._y = this._frame.height - this._bottom - this._btnHeight;
        this._button = this.updateButton();
    }

    updateButton() {
        const x1 = this._x;
        const x2 = x1 + this._r;
        const x4 = x1 + this._btnWidth;
        const x3 = x4 - this._r;

        const y1 = this._y;
        const y2 = y1 + this._r;
        const y4 = y1 + this._btnHeight;
        const y3 = y4 - this._r;

        const btn = new Path2D();
        btn.moveTo(x2, y1);
        btn.lineTo(x3, y1);
        btn.arcTo(x4, y1, x4, y2, this._r);
        btn.lineTo(x4, y3);
        btn.arcTo(x4, y4, x3, y4, this._r);
        btn.lineTo(x2, y4);
        btn.arcTo(x1, y4, x1, y3, this._r);
        btn.lineTo(x1, y2);
        btn.arcTo(x1, y1, x2, y1, this._r);


        btn.closePath();
        return btn;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    postRender(ctx) {
        ctx.fillStyle = this._bgColor;
        ctx.fill(this._button);

        ctx.fillStyle = 'white';
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this._text, this._x + this._btnWidth / 2, this._y + this._btnHeight / 2);
    }

    onMouseMove(e) {
        if (this._state != 'copying') {
            if (this.onButton(e)) {
                if (this._state != 'inside') {
                    this._bgColor = '#56c6fa';
                    this._state = 'inside';
                }
            } else if (this._state != 'outside') {
                this._bgColor = 'blue';
                this._state = 'outside';
            }
        }
        this._lastE = e;
    }

    onClick(e) {
        if (this.onButton(e)) {
            const search = new URLSearchParams(location.search);
            search.set('cameraX', this._cameraPos.x);
            search.set('cameraY', this._cameraPos.y);
            search.set('cameraZ', this._cameraPos.z);

            this._state = 'copying';
            this._lastE = e;
            navigator.clipboard.writeText(location.origin + '/?' + search).then(() => {
                this._bgColor = 'lime';
                this._text = 'Copied!';
            }).catch(err => {
                this._bgColor = 'red';
                this._text = err.message;
            }).then(() => {
                setTimeout(() => {
                    this._state = null;
                    this._text = 'Copy Coordinates';
                    this.onMouseMove(this._lastE);
                }, 1000);
            });
        }
    }

    onButton(e) {
        return this._ctx.isPointInPath(this._button, e.x, e.y);
    }
}

customElements.define('copy-coords', CopyCoords);