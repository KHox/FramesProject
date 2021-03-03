Math.sqr = x => x * x;

class GameMap {
    constructor(raySpeed, rayAccuracy) {
        this.width = 32;
        this.height = 32;
    
        this._arr = new Array(this.width * this.height);
        
        for (let i = 0; i < GameMap.mapPrototype.length; i++) {
            let cell = GameMap.mapPrototype[i];
            
            if (cell == '#') {
                this._arr[i] = new Wall(3);
            } else if (cell == '.') {
                this._arr[i] = null;
            }
        }
        
        this.raySpeed = raySpeed;
        this.rayAccuracy = rayAccuracy;
    }

    rayCast(x, y, a, length = 20) {
        if (length < 0) {
            a += Math.PI;
            length = -length;
        }
        let projX = +Math.cos(a).toFixed(9);
        let projY = +Math.sin(a).toFixed(9);
        let xlvl = Math.round(x);
        let ylvl = Math.round(y);

        if (xlvl < 0 || xlvl > this.width - 1 || ylvl < 0 || ylvl > this.height - 1) {
            throw new TypeError('Incorrect coordinates');
        }

        let nullResult = {
            hit: false,
            distance: length,
            cell: null
        };

        let cell = this._arr[ylvl * this.width + xlvl];
        if (cell) {
            return {
                hit: true,
                distance: 0,
                cell
            };
        } else {
            let distance;
            if (projX) {
                let k = projY / projX;
                let b = y - k * x;

                let lastX = x + length * projX;
                if (lastX > this.width - 1) {
                    lastX = this.width - 1;
                } else if (lastX < 0) {
                    lastX = 0;
                }
        
                let lastY = lastX * k + b;
                if (lastY < 0) {
                    lastY = 0;
                    lastX = (lastY - b) / k;
                } else if (lastY > this.height - 1) {
                    lastY = this.height - 1;
                    lastX = (lastY - b) / k;
                }

                let xStep = projX < 0 ? -1: 1;
                let yStep = projY < 0 ? -1: 1;

                let rLastX = Math.round(lastX);
                let rLastY = Math.round(lastY) + yStep;
                let prevY = ylvl + yStep;

                for (let _x = xlvl; _x != rLastX;) {
                    let nextY = Math.round((_x + xStep / 2) * k + b) + yStep;
                    for (let _y = prevY; _y != nextY; _y += yStep) {
                        cell = this._arr[_y * this.width + _x];
                        let fy = _y - yStep / 2;
                        distance = Math.sqrt(Math.sqr(x - (fy - b) / k) + Math.sqr(y - fy));
                        if (distance > length) {
                            return nullResult;
                        } else if (cell) {
                            return {
                                hit: true,
                                distance,
                                cell
                            };
                        }
                    }

                    _x += xStep;
                    cell = this._arr[(nextY - yStep) * this.width + _x];
                    let fx = _x - xStep / 2;
                    distance = Math.sqrt(Math.sqr(x - fx) + Math.sqr(y - (fx * k + b)));
                    if (distance > length) {
                        return nullResult;
                    } else if (cell) {
                        return {
                            hit: true,
                            distance,
                            cell
                        }
                    }

                    
                    prevY = nextY;
                }

                for (let _y = prevY; _y != rLastY; _y += yStep) {
                    cell = this._arr[_y * this.width + rLastX];
                    let fy = _y - yStep / 2;
                    distance = Math.sqrt(Math.sqr(x - (fy - b) / k) + Math.sqr(y - fy));
                    if (distance > length) {
                        return nullResult;
                    } else if (cell) {
                        return {
                            hit: true,
                            distance,
                            cell
                        };
                    }
                }
            } else {
                let lastY = ylvl + projY * length;
                if (lastY < 0) {
                    lastY = -1;
                } else if (lastY > this.height - 1) {
                    lastY = this.height;
                }

                for (let _y = ylvl + projY; _y != lastY; _y += projY) {
                    cell = this._arr[_y * this.width + xlvl];
                    distance = Math.abs(_y - projY / 2 - y);
                    if (distance > length) {
                        return nullResult;
                    } else if (cell) {
                        return {
                            hit: true,
                            distance,
                            cell
                        };
                    }
                }
            }
        }

        return nullResult;
    }

    rayCast_old(x, y, a, length = 20) {
        let sp = this.raySpeed;
		let dx = Math.cos(a) * sp;
		let dy = Math.sin(a) * sp;

		let distance = sp;
		let hit = false;
        let n = 0;
        let cell;

        x += dx;
        y += dy;

        let rx = Math.round(x);
	    let ry = Math.round(y);

	    while (!hit && distance <= length) {
			if (rx < 0 || ry < 0 || rx > this.width - 1 || ry > this.height - 1 || (cell = this._arr[ry * this.width + rx])) {
                distance -= sp;
                x -= dx;
                y -= dy;
                sp /= 10;
                dx = Math.cos(a) * sp;
                dy = Math.sin(a) * sp;
                n++;
                if (n == this.rayAccuracy) {
                    hit = true;
                }
            }

            distance += sp;
			x += dx;
			y += dy;
            rx = Math.round(x);
            ry = Math.round(y);
		}

        return {
            hit,
            distance,
            cell
        };
    }
}

class Wall {
    constructor(height) {
        this.height = height;
    }
}

GameMap.mapPrototype = '';
GameMap.mapPrototype += '################################';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#......................#####...#';
GameMap.mapPrototype += '###############........#.......#';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#...#..#..#............#...#####';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#....#############.....#.......#';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '#......................#.......#';
GameMap.mapPrototype += '############...........#.......#';
GameMap.mapPrototype += '#..............................#';
GameMap.mapPrototype += '#..............................#';
GameMap.mapPrototype += '#..............................#';
GameMap.mapPrototype += '#.....#######.....#####........#';
GameMap.mapPrototype += '#........#.......#.....#.......#';
GameMap.mapPrototype += '#........#.......#.............#';
GameMap.mapPrototype += '#........#........#####........#';
GameMap.mapPrototype += '#........#.............#.......#';
GameMap.mapPrototype += '#....#...#.......#.....#.......#';
GameMap.mapPrototype += '#.....###.........#####........#';
GameMap.mapPrototype += '#..............................#';
GameMap.mapPrototype += '#......###############.........#';
GameMap.mapPrototype += '#..............................#';
GameMap.mapPrototype += '#....#....#....#....#...#......#';
GameMap.mapPrototype += '#....#....#....#....#...#......#';
GameMap.mapPrototype += '#....#....#....#....#...#......#';
GameMap.mapPrototype += '#..............................#';
GameMap.mapPrototype += '################################';