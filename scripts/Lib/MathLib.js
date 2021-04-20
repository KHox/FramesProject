export function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export function randFloat(n) {
    return Math.random() * n;
}

export function randInt(n) {
    return Math.floor(randFloat(n));
}

export function getRandRGB() {
    return `rgb(${randInt(256)}, ${randInt(256)}, ${randInt(256)})`;
}

const mul = 64525;
const shift = 1013904223;
const range = 2147483648;

export class PRNG {
    constructor(seed = 0, ranged = true) {
        this.seed = seed;
        this.ranged = ranged;
    }

    random() {
        this.seed = (((mul * this.seed) + shift) % range);
        if (this.ranged) {
            return this.seed / range;
        } else {
            return this.seed;
        }
    }
}

Math.PRNG = PRNG;