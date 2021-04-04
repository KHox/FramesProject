import { FrameRenderableComponent } from "../FrameSystem/index.js";
import { InputFormater, Ray, Vec2 } from "../Lib/index.js";
import { Object2D } from "./DrawingMapSystem/DrawingMapSystem.js";

export class Main extends FrameRenderableComponent {
    onOpen() {
        this._dms = this._frame.getComponents('DrawingMapSystem')[0];

        /**
         * @type {Array<Object2D>}
         */
        this._ships = this._dms.getObjectsByName('ship');

        this._rotateAngle = Math.PI / 3000;
        this._positionAngle = Math.PI / 6000;

        this._IF = new InputFormater();
        this._moveSpeed = 400;
        this._sprintMul = 1.5;
        this._direction = Vec2.identy;
        this._isSprint = false;

        this._ct = this._dms.cameraTransform;

        const yOff = this._frame.height / 3;
        const xOff = this._frame.width / 5; 
        let y = -yOff;

        this._ships.forEach((ship, i) => {
            ship.src = `./img/Space ships/SpaceShip${i + 1}.png`;
            ship.transform = [((i % 5) - 2) * xOff, y, Math.PI * Math.random()];
            ship.onload = onLoad;

            setRandOutline(ship);
            if (i % 5 == 4) {
                y += yOff;
            }
        });

        function onLoad(ship) {
            if (ship.height > yOff) {
                let mul = yOff / ship.height;
                ship.height *= mul;
                ship.width *= mul;
            }
        }

        function setRandOutline(obj) {
            let r = Math.floor(Math.random() * 256);
            let g = Math.floor(Math.random() * 256);
            let b = Math.floor(Math.random() * 256);

            obj.outline.color = `rgb(${r}, ${g}, ${b})`;
        }

        this._stations = this._dms.getObjectsByName('station');

        const w3 = this._frame.width / 3;

        this._stations.forEach((s, i) => {
            s.src = `./img/Stations/SS1_tier${i + 1}.png`;
            s.transform = [this._frame.width + (i - 1) * w3, 0, Math.PI * Math.random()];

            setRandOutline(s);
        });

        this._rays = [];
        this._p1 = null;
    }

    onKeyDown(keys) {
        if (this._IF.down(
            keys.KeyW,
            keys.KeyS,
            keys.KeyA,
            keys.KeyD
        )) {
            if (keys.ShiftLeft) {
                this._isSprint = true;
            }

            this.calcMovement();
        } else if (keys.ShiftLeft) {
            this._isSprint = true;
            this.calcMovement();
        }
    }

    onKeyUp(keys) {
        if (this._IF.up(
            keys.KeyW,
            keys.KeyS,
            keys.KeyA,
            keys.KeyD
        )) {
            if (keys.ShiftLeft) {
                this._isSprint = false;
            }

            this.calcMovement();
        } else if (keys.ShiftLeft) {
            this._isSprint = false;
            this.calcMovement();
        }
    }

    tick() {
        this._ct.position.x += this._direction.x * this._frame.time.deltaTick / 1000;
        this._ct.position.y += this._direction.y * this._frame.time.deltaTick / 1000;
    }

    calcMovement() {
        let dir = this._IF.getDirection().mul(this._moveSpeed);

        if (this._isSprint) {
            this._direction = dir.mul(this._sprintMul);
        } else {
            this._direction = dir;
        }
    }

    postRender(ctx) {
        this._ships.forEach(ship => {
            ship.transform.rotation += -this._rotateAngle * this._frame.time.deltaFrame;
        });

        this._stations.forEach(ship => {
            ship.transform.rotation += -this._rotateAngle * this._frame.time.deltaFrame;
        });

        let arr;

        if (this._p1 && this._p2) {
            this.drawLine(ctx, this._p1, this._p2, 'lime');

            let rayData = {
                ray: Ray.createByPoints(this._p1, this._p2),
                isCollide: false
            };
            
            arr = this._rays.concat(rayData);
        } else {
            arr = this._rays;
        }

        this.checkRays(arr);
        arr.forEach(rd => {
            this.drawLine(ctx, rd.ray.origin, rd.ray.origin.plus(rd.ray.direction), rd.isCollide ? 'red' : 'lime');
            rd.isCollide = false;
        });
        
        //this._ship.transform.position = this._ship.transform.position.rotate(this._positionAngle * this._frame.time.deltaFrame);
    }
    
    drawLine(ctx, p1, p2, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    onBlur() {
        this._IF.clear();
    }

    onMouseDown(data) {
        this._p1 = new Vec2(data.x, data.y);
        this._p2 = this._p1;
    }

    onMouseMove(x, y) {
        if (this._p1 && this._p2) {
            this._p2 = this._p2.plus(new Vec2(x, y));
        }
    }

    onMouseUp(data) {
        if (this._p1 && this._p2) {
            let rayData = {
                ray: Ray.createByPoints(this._p1, this._p2),
                isCollide: false
            };
            this._rays.push(rayData);
        }
        this._p1 = null;
        this._p2 = null;
    }

    checkRays(rays) {
        for (let i = 0; i < rays.length; i++) {
            for (let j = i + 1; j < rays.length; j++) {
                if (rays[i].ray.getCollidePoint(rays[j].ray)) {
                    rays[i].isCollide = true;
                    rays[j].isCollide = true;
                }
            }
        }
    }
}

customElements.define('main-script', Main);