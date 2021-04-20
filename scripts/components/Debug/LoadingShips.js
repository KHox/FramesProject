import { FrameRenderableComponent } from "../../FrameSystem/index.js";
import { getRandRGB } from "../../Lib/index.js";
import { Object2D } from "../DrawingMapSystem/DrawingMapSystem.js";
import { ShipBehavior } from "../ShipBehavior.js";

const shipsCount = 22;
const stationsCount = 3;

export class LoadingShips extends FrameRenderableComponent {
    onOpen() {
        this._dms = this._frame.getComponents('DrawingMapSystem')[0];
        this._st = [];
        this._lb = [];
        this._bar = null;

        if (this._shipsCount === undefined) {
            this._shipsCount = shipsCount;
        }
            
        if (!this._dms) {
            this.switchOff();
        } else {
            this.loadShips();
        }
    }

    onAddComponents(comps) {
        if (!this._dms) {
            let dms = comps.find(c => c.name == 'DrawingMapSystem');
            if (dms) {
                this._dms = dms;
                this.switchOn();
                this.loadShips();
            }
        }
    }

    loadShips() {
        this.loadElements('./img/Stations/SS1_tier', stationsCount, 'station', stationsCount, this._frame.width);        
        this.loadElements('./img/Space ships/SpaceShip', this._shipsCount, 'ship', shipsCount);
    }

    getRowsColumns(ratio, count) {
        let rows = 1;
        let columns = count;
        
        let sub = Math.abs(ratio - rows / columns);
        for (rows = 2; rows <= count; rows++) {
            columns = Math.ceil(count / rows);
            let n = Math.abs(ratio - rows / columns);
            if (n > sub) {
                rows--;
                columns = Math.ceil(count / rows);
                break;
            } else {
                sub = n;
            }
        }

        return {
            rows,
            columns
        };
    }

    loadElements(path, count, name, divis = count, offsetX = 0, offsetY = 0) {
        let fh = this._frame.height;
        let fw = this._frame.width;

        const {rows, columns} = this.getRowsColumns(fh / fw, count);
        const hPart = fh / rows;
        const wPart = fw / columns;
        let yOff = (hPart - fh) / 2;
        let xOff = (wPart - fw) / 2;

        let maxSize = Math.min(hPart, wPart);
        let offset = Math.min(5, 0.05 * maxSize);

        let data = {
            path,
            count,
            name,
            divis,
            offsetX,
            offsetY,
            maked: 0,
            loaded: 0,
            rows,
            columns,
            fw,
            fh,
            readyies: [],
            hPart,
            wPart,
            yOff,
            xOff,
            sX: this._frame.centerX - fw / 6,
            sY: this._frame.centerY - 25,
            maxSize,
            offset,
            client: maxSize - 2 * offset,
            time: performance.now()
        };

        if (!this._bar) {
            this._bar = data;
        }

        this._st.push(data);
        this._lb.push(data);
    }

    tick() {
        let data = this._st[0];
        if (data) {
            let onLoad = elem => {
                data.loaded++;
                let max = Math.max(elem.width, elem.height);
                let mul = data.client / max;
                elem.width *= mul;
                elem.height *= mul;
                elem.outlineHeight = elem.outlineWidth = 5;//data.offset;

                //elem.outlineColor = getRandRGB();
                data.readyies.push(elem);
                /*
                if (data.loaded % 5000 == 0) {
                    console.log(data.loaded, performance.now());
                }
                */
                if (data.loaded == data.count) {
                    this._dms.addComponents(data.readyies);
                    console.log(performance.now());
                    //data.readyies = [];
                }
            };

            let onError = e => {
                data.loaded++;
                if (data.loaded == data.count) {
                    this._dms.addComponents(data.readyies);
                    console.log(performance.now());
                }
            }

            let delta = data.count - data.maked;
            if (delta > 10) {
                delta = 10;
            } else {
                this._st.shift();
            }
            
            for (let i = data.maked; i < data.maked + delta; i++) {
                const o = new Object2D(data.path + `${i % data.divis + 1}.png`);
                o.name = data.name;
                o.outlineColor = getRandRGB();
                o.onload = onLoad;
                o.onerror = onError;
                
                let x = i % data.columns;
                let y = (i - x) / data.columns;
                
                o.transform.position = [
                    data.offsetX + data.xOff + x * data.wPart,
                    data.offsetY + data.yOff + y * data.hPart,
                    (data.count - i - 1) * -1000
                ];

                if (data.name == 'ship') {
                    o.addComponents([
                        new ShipBehavior()
                    ]);
                }
            }

            data.maked += delta;
        }
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    postRender(ctx) {
        if (this._bar) {
            let w3 = this._frame.width / 3;
            let cX = this._frame.centerX;
            let cY = this._frame.centerY;
            let sX = cX - w3 / 2;
            let r = this._bar.loaded / this._bar.count;

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.fillStyle = 'blue';

            ctx.fillRect(sX, cY - 25, w3 * r, 50);
            ctx.strokeRect(sX, cY - 25, w3, 50);

            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((r * 100).toFixed(1) + '%', cX, cY);

            if (this._bar.loaded == this._bar.count) {
                this._lb.shift();
                this._bar = this._lb[0];
            }
        }
    }

    static get observedAttributes() {
        return ['ships-count'].concat(super.observedAttributes);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name == 'ships-count') {
            this._shipsCount = +newValue;
        }
    }
}

customElements.define('loading-ships', LoadingShips);