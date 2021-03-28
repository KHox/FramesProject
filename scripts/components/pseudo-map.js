import { RenderableFrameComponent } from "../frameComponentSystem/Frame.js";

export class PseudoMap extends RenderableFrameComponent {
    init() {
        this._player = this._frame.querySelector('player-behavior');
        if (!this._player) {
            this._isActive = false;
            return;
        }

        this._moveables = [];
        super.init();
    }

    initRender() {
        importScripts('../OldMap.js');
        return {
            _map: new GameMap(0.1, 4)
        };
    }

    preRender() {
        let result = {
            width: this._frame.width,
            a: this._player.a,
            x: this._player.x,
            y: this._player.y,
            fov: Math.PI * 2 / 3,
            vertFov: Math.PI / 4
        }

        if (this._moveables.length) {
            result.moves = this._moveables.map(v => {
                let result = {
                    x: v.moveable.x,
                    y: v.moveable.y,
                    dx: v.x,
                    dy: v.y
                };

                v.x = 0;
                v.y = 0;

                return result;
            });
        }

        return result;
    }

    render(data) {
        let hits = new Array(data.width + 1);
        let leftFov = data.a - data.fov / 2;
		let k = data.fov / data.width;
        let tan = Math.tan(data.vertFov);
        
		for (let x = 0; x <= data.width; x++) {
            let angle = leftFov + x * k;
			hits[x] = this._map.rayCast(data.x, data.y, angle, 64);
            if (hits[x].hit) {
                hits[x].topOffset = (1 - hits[x].cell.height / 2 / hits[x].distance / tan / Math.cos(angle - data.a)) / 2;
            }
		}

        const result = {
            allRays: hits
        };

        if (data.moves) {
            for (let i = 0; i < data.moves.length; i++) {
                const req = data.moves[i];
                let l1 = req.dx != 0 ? (req.dx < 0 ? Math.min(req.dx, -0.05) : Math.max(req.dx, 0.05)) : null;
                let l2 = req.dy != 0 ? (req.dy < 0 ? Math.min(req.dy, -0.05) : Math.max(req.dy, 0.05)) : null;

                if (l1 && this._map.rayCast(req.x, req.y, 0, l1).hit) {
                    req.dx = 0;
                }
                if (l2 && this._map.rayCast(req.x, req.y, Math.PI / 2, l2).hit) {
                    req.dy = 0;
                };
            }

            result.moves = data.moves;
        }
        
        return result;
    }

    postRender(data) {
        if (data.moves) {
            for (let i = 0; i < data.moves.length; i++) {
                this._moveables[i].moveable.moveBy(data.moves[i].dx, data.moves[i].dy);
            }

            this._moveables.splice(0, data.moves.length);
        }

        let ctx = this._frame.ctx;
        ctx.fillStyle = 'gray';

        for (let i = 0; i < this._frame.width; i++) {
            let hit = data.allRays[i];
            if (hit.hit) {
                let p = hit.topOffset * this._frame.height;
                ctx.beginPath();
                ctx.moveTo(i, p);
                ctx.lineTo(i, this._frame.height - p);
                ctx.lineTo(i + 1, this._frame.height - p);
                ctx.lineTo(i + 1, p);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    canIMove(moveable, x, y) {
        let mData = this._moveables.find(v => v.moveable == moveable);
        if (!mData) {
            mData = {
                moveable,
                x: 0,
                y: 0
            };
            this._moveables.push(mData);
        }

        mData.x += x;
        mData.y += y;
    }
}

customElements.define('pseudo-map', PseudoMap);