import { FrameRenderableComponent } from "../FrameSystem/index.js";
import { InputFormater, Ray, Transform, Vec2 } from "../Lib/index.js";
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

        this._camRot = Math.PI / 2000;
        this._camLeftRot = 0;
        this._camRightRot = 0;

        this._IF = new InputFormater();
        this._moveSpeed = 400;
        this._sprintMul = 1.5;
        this._direction = Vec2.identy;
        this._isSprint = false;
        
        this._ct = this._dms.cameraTransform;

        this._moving = false;
        this._p1 = this._p2 = this._mp = Vec2.identy;

        const w5 = this._frame.width / 5;
        const h3 = this._frame.height / 3;
        const xOff = w5 / 2; 
        const yOff = h3 / 2;
        
        this._ships.forEach((ship, i) => {
            ship.src = `./img/Space ships/SpaceShip${i + 1}.png`;
            ship.transform = [xOff + w5 * (i % 5), yOff + h3 * Math.floor(i / 5), Math.PI * Math.random()];
            ship.onload = onLoad;
            
            setRandOutline(ship);
        });
        
        function onLoad(ship) {
            if (ship.height > h3) {
                let mul = h3 / ship.height;
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
            s.transform = [this._frame.width + w3 / 2 + i * w3, this._frame.height / 2, Math.PI * Math.random()];
            
            setRandOutline(s);
        });
        
        this._rays = [];
        this._p1 = null;

        this._lookAtPoint = Vec2.up.mul(yOff * 1.5);
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

        if (keys.KeyQ) {
            this._camLeftRot = 1;
        }
        if (keys.KeyE) {
            this._camRightRot = 1;
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

        if (keys.KeyQ) {
            this._camLeftRot = 0;
        }
        if (keys.KeyE) {
            this._camRightRot = 0;
        }
    }

    tick() {
        this._ct.position.x += this._direction.x * this._frame.time.deltaTick / 1000;
        this._ct.position.y += this._direction.y * this._frame.time.deltaTick / 1000;
        this._ct.rotation += (this._camLeftRot - this._camRightRot) * this._camRot * this._frame.time.deltaTick;
    }

    calcMovement() {
        let dir = this._IF.getDirection().rotateByMatrix(Transform.reverseMatrix(this._ct.rotationMatrix)).mul(this._moveSpeed);

        if (this._isSprint) {
            this._direction = dir.mul(this._sprintMul);
        } else {
            this._direction = dir;
        }
    }

    postRender(ctx) {
        this._ships.forEach(ship => {
            //ship.transform.rotation += -this._rotateAngle * this._frame.time.deltaFrame;
            //ship.transform.lookAt(this._lookAtPoint);
        });

        this._stations.forEach(ship => {
            ship.transform.rotation += -this._rotateAngle * this._frame.time.deltaFrame;
        });

        let arr;

        if (this._moving) {
            let rayData = {
                ray: Ray.createByPoints(this._p1, this._dms.screenToWorldMatrix(this._mp)),
                isCollide: false
            };
            
            arr = this._rays.concat(rayData);
        } else {
            arr = this._rays;
        }

        this.checkRays(arr);
        arr.forEach(rd => {
            this._dms.drawLine(rd.ray.origin, rd.ray.origin.plus(rd.ray.direction), rd.isCollide ? 'red' : 'lime');
            rd.isCollide = false;
        });

        //this._lookAtPoint = this._lookAtPoint.rotate(this._rotateAngle * this._frame.time.deltaFrame);
        this.updateLook();
    }
    
    onBlur() {
        this._IF.clear();
    }

    onMouseDown(data) {
        this._mp = new Vec2(data.x, data.y);
        this._p1 = this._dms.screenToWorldMatrix(this._mp);
        this._moving = true;
    }

    onMouseMove(data) {
        this._mp = new Vec2(data.x, data.y);
    }

    onMouseUp(data) {
        if (this._moving) {
            let rayData = {
                ray: Ray.createByPoints(this._p1, this._dms.screenToWorldMatrix(this._mp)),
                isCollide: false
            };
            this._rays.push(rayData);
        }
        this._moving = false;
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

    updateLook() {
        this._p2 = this._dms.screenToWorldMatrix(this._mp);
        this._ships.forEach(ship => {
            ship.transform.lookAt(this._p2);
        });
    }
}

customElements.define('main-script', Main);