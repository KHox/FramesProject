import { FrameComponent } from "../../FrameSystem/index.js";
import { getRandRGB } from "../../Lib/index.js";
import { Object2D } from "../DrawingMapSystem/DrawingMapSystem.js";

const shipsCount = 15;
const stationsCount = 3;

export class LoadingShips extends FrameComponent {
    onOpen() {
        this._dms = this._frame.getComponents('DrawingMapSystem')[0];
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
        this.loadElements('./img/Space ships/SpaceShip', shipsCount, 'ship');
        this.loadElements('./img/Stations/SS1_tier', stationsCount, 'station', this._frame.width);        
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

    loadElements(path, count, name, offsetX = 0, offsetY = 0) {
        let fh = this._frame.height;
        let fw = this._frame.width;

        let {rows, columns} = this.getRowsColumns(fh / fw, count);
        
        const hPart = fh / rows;
        const wPart = fw / columns;
        let yOff = (hPart - fh) / 2;
        let xOff = (wPart - fw) / 2;
        
        let maxSize = Math.min(hPart, wPart);
        
        let onLoad = elem => {
            let max = Math.max(elem.width, elem.height);
            if (max > maxSize) {
                let mul = maxSize / max;
                elem.width *= mul;
                elem.height *= mul;
            }
            this._dms.addObject(elem);
        };
        
        for (let i = 0; i < count; i++) {
            const o = new Object2D(path + `${i + 1}.png`);
            o.name = name;
            o.outline.color = getRandRGB();
            o.onload = onLoad;
            
            let x = i % columns;
            let y = (i - x) / columns;
            
            o.transform.position = [offsetX + xOff + x * wPart, offsetY + yOff + y * hPart];
        }
    }
}

customElements.define('loading-ships', LoadingShips);