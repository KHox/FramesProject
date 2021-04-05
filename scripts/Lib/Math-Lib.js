export function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export function randInt(n) {
    return Math.floor(randFloat(n));
}

export function randFloat(n) {
    return Math.random() * n;
}

export function getRandRGB() {
    return `rgb(${randInt(256)}, ${randInt(256)}, ${randInt(256)})`;
}