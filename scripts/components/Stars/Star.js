import { Vec3 } from "../../Lib/index.js";
import { Object2D } from "../DrawingMapSystem/DrawingMapSystem.js";
const starImage = document.createElement('canvas');
const imageCtx = starImage.getContext('2d');

const size = 1000;

starImage.width = size;
starImage.height = size;

imageCtx.fillStyle = 'white';
imageCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
imageCtx.fill();

export class Star extends Object2D {
    /**
     * @param {Vec3} vec3
     */
    constructor(vec3) {
        super();
        this.image = starImage;
        this.transform.position = vec3;
    }
}

customElements.define('star-element', Star);