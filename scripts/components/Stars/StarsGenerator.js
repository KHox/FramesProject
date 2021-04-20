import { FrameRenderableComponent } from "../../FrameSystem/index.js";
import { DrawingMapSystem } from "../DrawingMapSystem/DrawingMapSystem.js";
import { Star } from "./Star.js";
import { PRNG, Vec2, Vec3 } from "../../Lib/index.js";

export const defX = 100;
export const defY = 963;

export const starsInSector = 2000;
export const sectorWidth   = 1500000;
export const sectorHeight  = 700000;
export const starOffset    = 1300000;
export const starDelta     = 400000;

export class StarsGenerator extends FrameRenderableComponent {
    constructor() {
        super();

        this._sc = starsInSector;
        this._sh = sectorHeight;
        this._sw = sectorWidth;

        this._sectors = new Map();
    }

    onOpen() {
        /**
         * @type {DrawingMapSystem}
         */
        this._dms = this._frame.getComponents('DrawingMapSystem')[0];
        this._ct = this._dms.cameraTransform;

        let s = this.generateSector(this._ct.position.x, this._ct.position.y, new Array(starsInSector));
        this._dms.addComponents(s);
    }

    generateSector(xPos, yPos, arr) {
        const pos = this.getSectorPos(xPos, yPos);

        const seedX = pos.x;
        const seedY = pos.y;
        const seedZ = pos.x / 2 + pos.y / 2;

        const xGen = new PRNG(seedX + defX);
        const yGen = new PRNG(seedY + defY);
        const zGen = new PRNG(seedZ);

        let x, y, z;

        for (let i = 0; i < arr.length; i++) {
            x = (xGen.random() - .5) * sectorWidth + pos.x;
            y = (yGen.random() - .5) * sectorHeight + pos.y;
            z = (zGen.random() - .5) * starDelta + starOffset;

            arr[i] = new Star(new Vec3(x, y, -z));
        }

        return arr;
    }

    getSectorPos(x, y) {
        return new Vec2(Math.floor(x / sectorWidth), Math.floor(y / sectorHeight));
    }
}

customElements.define('stars-generator', StarsGenerator);