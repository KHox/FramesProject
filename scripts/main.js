/*window.addEventListener('load', () => {
	const step = 0.1;
	const speed = 0.001;
	const sensetivity = 0.0002;
	const wallH = 2;

	const keys = {};
	let lastX;
	let da = 0;

	const snWidth = window.screen.width;
	const snHeight = window.screen.height;

	const halfSn = snHeight / 2;

	const screen = document.getElementById('screen');
	screen.requestPointerLock = screen.requestPointerLock || screen.mozRequestPointerLock || screen.webkitRequestPointerLock;
	screen.width = snWidth;
	screen.height = snHeight;
	document.body.style.width = snWidth + 'px';
	document.body.style.height = snHeight + 'px';

	const ctx = screen.getContext('2d');
	ctx.lineJoin = 'round';

	let map = getMap();

	const heightStep = snHeight / map.height;
	const widthStep = snWidth / map.width;

	let ind = map.arr.indexOf('p');

	const player = {
		x: ind % map.width,
		y: ind / map.width ^ 0,
		a: 0
	};

	let fov = round(Math.PI / 2);
	let vFovH = round(Math.PI / 30);

	let k = round(Math.tan(vFovH) * heightStep);
	let last = performance.now();
	let lastS = last;
	let curr;
	let delt;
	let fps = 0;
	let lockTime;
	let hideTime;
	let lock = false;
	let isFullscreen = false;
	let isFl = true;
	let isSk = true;

	let skyTime;
	let floorTime;

	let id = setInterval(() => {
		curr = performance.now();
		delt = curr - last;
		fps++;
		render();

		if (!lock) da = 0;

		if (keys.KeyL && (!lockTime || (curr - lockTime) >= 200)) {
			lockTime = curr;
			lock = !lock;
			document.body.classList.toggle('lock');
		}
		if (keys.KeyH && (!hideTime || (curr - hideTime) >= 200)) {
			hideTime = curr;
			instruct.hidden = !instruct.hidden;
		}

		if (keys.KeyF && (!floorTime || (curr - floorTime) >= 200)) {
			floorTime = curr;
			isFl = !isFl;
		}

		if (keys.KeyO && (!skyTime || (curr - skyTime) >= 200)) {
			skyTime = curr;
			isSk = !isSk;
		}

		let forw = 0;
		let lr = 0;
		if (keys.KeyW) {
			forw += speed;
		}
		if (keys.KeyS) {
			forw -= speed;
		}
		if (keys.KeyA) {
			lr -= speed;
		}
		if (keys.KeyD) {
			lr += speed;
		}

		if (da == 0) {
			if (keys.ArrowLeft) {
				da -= 10;
			}
			if (keys.ArrowRight) {
				da += 10;
			}
		}

		if (lr && forw) {
			lr /= Math.sqrt(2);
			forw /= Math.sqrt(2);
		}

		let sin = Math.sin(player.a);
		let cos = Math.cos(player.a);

		let dx = (forw * cos - lr * sin) * delt;
		let dy = (forw * sin + lr * cos) * delt;

		if (keys.ShiftLeft) {
			dx *= 2;
			dy *= 2;
		}

		moveTo(player.x + dx, player.y + dy, player.a + da * sensetivity * delt);
		da = 0;
		last = curr;
		if (last - lastS >= 1000) {
		addData.textContent = fps;
		fps = 0;
		lastS = last;
		}
	});

	function render() {
		ctx.clearRect(0, 0, snWidth, snHeight);
		let last;
		let saved;
		let kf, bf;
		for (let x = 0; x <= snWidth; x++) {
			let data = convert(rayCast(player.a + -fov / 2 + x * fov / snWidth), x);
			if (kf === undefined) {
				saved = data;
				kf = 1;
			} else if (bf === undefined) {
				last = data;
				bf = 1;
			} else if (last.hit != saved.hit) {
				draw(saved, last);
				saved = last;
				last = data;
			} else {
				kf = round((last.y - saved.y) / (last.x - saved.x));
				bf = round(saved.y - saved.x * kf);
				if (data.x * kf + bf == data.y) {
				last = data;
				} else {
				draw(saved, last);
				saved = last;
				last = data;
				}
			}
		}
		draw(saved, last);
	}

	function draw(data1, data2) {
		if (data1 == undefined) console.log(data2);
		let c = 240 - Math.round(200 * data1.y / halfSn);
		//let c = Math.floor(Math.random() * 256);
		if (c > 230) c = 230;
		if (isSk) drawSky(data1, data2, c);
		if (isFl) drawFloor(data1, data2, c);
		if (data1.hit) {
			drawWall(data1, data2, c);
		}
	}

	function convert(dd, x) {
		let h = round(dd.distance * k);
		return {
			y: round(halfSn * (h - wallH) / h),
			x: x,
			hit: dd.hit,
			color: dd.color
		};
	}

	function rayCast(a, l = 20) {
		let sp = step;
		let dx = Math.cos(a) * step;
		let dy = Math.sin(a) * step;

		let distance = 0;
		let hitWall = false;

		let _x = player.x;
		let _y = player.y;

		let n = 0;

		while (!hitWall && distance <= l) {
			distance += sp;
			_x += dx;
			_y += dy;
			let x = Math.round(_x);
			let y = Math.round(_y);

			if (x < 0 || y < 0 || x > map.width - 1 || y > map.height - 1) {
				hitWall = true;
			} else {
				let testCell = map.arr[y * map.width + x];

				if (testCell == '#' || testCell == '?') {
					distance -= sp;
					_x -= dx;
					_y -= dy;
					sp /= 10;
					dx = Math.cos(a) * sp;
					dy = Math.sin(a) * sp;
					n++;
					if (n > 4) {
						hitWall = true;
						if (testCell == '?') {
							return {
								hit: hitWall,
								distance: distance,
								color: 'pink'
							};
						}
					}
				}
			}
		}

		return {
			hit: hitWall,
			distance: distance
		};
	}

	function drawWall(d1, d2, c) {
		ctx.fillStyle = d1.color || 'rgb(' + c + ', ' + c + ', ' + c + ')';
		ctx.beginPath();
		ctx.moveTo(d1.x, d1.y);
		ctx.lineTo(d2.x, d2.y);
		ctx.lineTo(d2.x, snHeight - d2.y);
		ctx.lineTo(d1.x, snHeight - d1.y);
		ctx.closePath();
		ctx.fill();
	}

	function drawFloor(d1, d2, c) {
		ctx.fillStyle = 'rgb(' + 140 + ', ' + 170 + ', ' + c + ')';
		ctx.beginPath();
		ctx.moveTo(d1.x, snHeight);
		ctx.lineTo(d2.x, snHeight);
		ctx.lineTo(d2.x, snHeight - d2.y - 1);
		ctx.lineTo(d1.x, snHeight - d1.y - 1);
		ctx.closePath();
		ctx.fill();
	}

	function drawSky(d1, d2, c) {
		ctx.fillStyle = 'rgb(' + c + ', ' + 140 + ', ' + 170 + ')';
		ctx.beginPath();
		ctx.moveTo(d1.x, 0);
		ctx.lineTo(d2.x, 0);
		ctx.lineTo(d2.x, snHeight - d2.y - 1);
		ctx.lineTo(d1.x, snHeight - d1.y - 1);
		ctx.closePath();
		ctx.fill();
	}

	function moveTo(x, y, a) {
		let cell = map.arr[Math.round(y) * map.width + Math.round(x)];
		if (cell == '?') endGame();
		if (cell != '#') {
			player.x = x;
			player.y = y;
		}
		player.a = a;
	}

	document.addEventListener('keydown', e => {
		keys[e.code] = true;
	});
	document.addEventListener('keyup', e => {
		keys[e.code] = false;
	});
	document.addEventListener('mousemove', e => {
		console.log(e.movementX, e.movementY);
		if (lastX === undefined) {
			lastX = e.pageX;
		} else {
			da = -(lastX - e.pageX);
			lastX += da;
		}
	});

	function toggleFullScreen(close) {
		let req;
        if (!isFullscreen && !close) {
			req = document.body.requestFullScreen || document.body.webkitRequestFullScreen || document.body.mozRequestFullScreen;
			//req.call(document.body);
			console.log('????');
			screen.requestPointerLock();
			lock = true;
        } else {
			req = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;
			//req.call(document);
			document.exitPointerLock();
			lock = false;
        }
        isFullscreen = !isFullscreen;
	}
	document.addEventListener('dblclick', () => toggleFullScreen());

	function endGame() {
		clearInterval(id);
		screen.hidden = true;
		addData.parentElement.hidden = true;
		instruct.hidden = true;
		end.hidden = false;
		document.body.classList.remove('lock');
		toggleFullScreen(true);
	}
});

function round(num) {
	return Math.round(num * 10000) / 10000;
}
*/
const worker = new Worker('scripts/Worker.js');

class Game {
	constructor(settings) {
		this._settings = settings;
		
		this._player = {
			x: 1,
			y: 1,
			ha: 0,
			va: 0,
			moveBy(x, y, ha, va) {
				if (x) {
					this.x += x;
				}
				if (y) {
					this.y += y;
				}
				if (ha) {
					this.ha += ha;
				}
				if (va) {
					this.va += va;
				}
			}
		};
	}
	
	init() {
		if (!document.documentElement.offsetHeight) {
			document.documentElement.style.height = screen.height + 'px';
		}
		Object.assign(this._settings, localStorage.getItem('GameSettings') || {
			fullscreen: true,
			snHeight: document.documentElement.offsetHeight,
			snWidth: document.documentElement.offsetWidth,
			showHeaderInfo: true,
			headerInfoFps: true,
			headerInfoUps: true,
			fov: 90,
			playerHeight: 1.8,
			playerSpeed: 1,
			multSpeed: 2,
			gSens: 0.3,
			vSens: 0.3,
			skyRender: true,
			floorRender: true
		});

		this._gameSet = {
			raySpeed: 0.01,
			rayAccuracy: 4,
			halfVFov: Math.PI / 3,
			hFov: this._settings.fov * Math.PI / 180,
			haSun: Math.PI * 5 / 6,
			vaSun: Math.PI / 4
		};
		
		this._holdedKeys = {};
		this._pressedKeys = {};
		this._uppedKeys = {};
		this._mouse = {
			dx: 0,
			dy: 0
		}

		this._moveIsEnd = true;
		this._gameElem = document.getElementById('game');
		
		this._screen = this._gameElem.querySelector('#screen');
		this._screen.width = this._settings.snWidth;
		this._screen.height = this._settings.snHeight;
		
		this._gameElem.requestFullscreen = this._gameElem.requestFullScreen || this._gameElem.webkitRequestFullScreen || this._gameElem.mozRequestFullScreen;
		document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;

		this._screen.requestPointerLock = this._screen.requestPointerLock || this._screen.mozRequestPointerLock;
		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

		this._controller = this._gameElem.querySelector('#controller');

		/**
		 * @type {CanvasRenderingContext2D}
		 */
		this._ctx = this._screen.getContext('2d');
		
		this._headerInfo = this._gameElem.querySelector('#header-info');
		
		if (this._settings.showHeaderInfo) {
			this._headerInfo.hidden = false;
			if (this._settings.headerInfoFps) {
				this._fpsCounter = this._headerInfo.querySelector('#fps > .count');
			} else {
				this._headerInfo.querySelector('#fps').hidden = true;
			}

			if (this._settings.headerInfoUps) {
				this._upsCounter = this._headerInfo.querySelector('#ups > .count');
			} else {
				this._headerInfo.querySelector('#ups').hidden = true;
			}
		} else {
			this._headerInfo.hidden = true;
		}
		
		//this._map = new GameMap(this._gameSet.raySpeed, this._gameSet.rayAccuracy);

		document.addEventListener('keydown', e => {
			this._holdedKeys[e.code] = true;
			this._pressedKeys[e.code] = true;
		});
		
		document.addEventListener('keyup', e => {
			this._holdedKeys[e.code] = false;
			this._uppedKeys[e.code] = true;
		});

		document.addEventListener('mousemove', e => {
			if (document.fullscreenElement) {
				this._mouse.dx = e.movementX;
				this._mouse.dy = e.movementY;
			}
		});

		document.addEventListener('touchstart', e => {
			if (e.target.closest('#controller')) {
				let cl = e.target.classList;
				if (cl.contains('forward')) {
					this._holdedKeys.KeyW = true;
				} else if (cl.contains('left')) {
					this._holdedKeys.KeyA = true;
				} else if (cl.contains('right')) {
					this._holdedKeys.KeyD = true;
				} else if (cl.contains('backward')) {
					this._holdedKeys.KeyS = true;
				}
			} else {
				this._lastTouch = e.changedTouches[0];
			}
		});

		document.addEventListener('touchend', e => {
			if (e.target.closest('#controller')) {
				let cl = e.target.classList;
				if (cl.contains('forward')) {
					this._holdedKeys.KeyW = false;
				} else if (cl.contains('left')) {
					this._holdedKeys.KeyA = false;
				} else if (cl.contains('right')) {
					this._holdedKeys.KeyD = false;
				} else if (cl.contains('backward')) {
					this._holdedKeys.KeyS = false;
				}
			} else {
				this._lastTouch = null;
			}
		});

		document.addEventListener('touchmove', e => {
			if (this._lastTouch) {
				let currentTouch = e.changedTouches[0];

				this._mouse.dx =  this._lastTouch.pageX - currentTouch.pageX;
				this._mouse.dy = this._lastTouch.pageY - currentTouch.pageY;

				this._lastTouch = currentTouch;
			}
		});

		document.addEventListener('dblclick', e => {
			e.preventDefault();
			this.toggleFullscreen();
		});

		window.addEventListener('resize', () => {
			if (this._settings.fullscreen) {
				this._screen.height = this._settings.snHeight = document.documentElement.offsetHeight;
				this._screen.width = this._settings.snWidth = document.documentElement.offsetWidth;
			}
		});

		worker.addEventListener('message', e => {
			if (e.data.hasOwnProperty('dx')) {
				this._player.moveBy(e.data.dx, e.data.dy);
				this._moveIsEnd = true;				
				return;
			}
			this._hits = e.data;
			this.render();
		});

		let f = () => {
			if (this._iterFps <= this._iterUps) {
				this._rayCast();
			}
			requestAnimationFrame(f);
		};

		requestAnimationFrame(f);

		this.start();
	}
	
	start() {
		this._iterFps = this._iterUps = 0;
		
		this._lastUpdate = this._lastSecond = performance.now();

		this._iterId = setInterval(() => {
			this.iter();
		});
	}
	
	iter() {
		this._currentTime = performance.now();
		this._deltaTime = (this._currentTime - this._lastUpdate) / 1e3;
		
		this._iterUps++;
		
		this.keysUpdate();
		this.clearKeys();

		this.mouseUpdate();
		
		if (this._currentTime - this._lastSecond >= 1000) {
			if (this._fpsCounter) {
				this._fpsCounter.textContent = this._iterFps;
			}
			if (this._upsCounter) {
				this._upsCounter.textContent = this._iterUps;
			}
			this._lastSecond = this._currentTime;
			this._iterUps = this._iterFps = 0;
		}

		this._lastUpdate = this._currentTime;

		//addData.textContent = `${this._player.x} ${this._player.y} : ${this._player.ha} ${this._player.va}`;
	}

	_tryMove(dx, dy) {
		if (this._moveIsEnd) {
			worker.postMessage({
				type: 'tryMoveBy',
				x: this._player.x,
				dx,
				y: this._player.y,
				dy
			});
			this._moveIsEnd = false;
		}
	}

	_rayCast() {
		worker.postMessage({
			type: 'rayCastAll',
			x: this._player.x,
			y: this._player.y,
			ha: this._player.ha,
			hFov: this._gameSet.hFov,
			halfVFov: this._gameSet.halfVFov,
			snWidth: this._settings.snWidth
		});
	}
	
	render() {
		//if (this._iterFps <= this._iterUps) {
			this._iterFps++;
			this._ctx.clearRect(0, 0, this._settings.snWidth, this._settings.snHeight);

			this._ctx.fillStyle = 'gray';
			for (let i = 0; i < this._settings.snWidth; i++) {
				let hit = this._hits[i];
				if (hit.hit) {
					let p = hit.topOffset * this._settings.snHeight;
					this._ctx.beginPath();
					this._ctx.moveTo(i, p);
					this._ctx.lineTo(i, this._settings.snHeight - p);
					this._ctx.lineTo(i + 1, this._settings.snHeight - p);
					this._ctx.lineTo(i + 1, p);
					this._ctx.closePath();
					this._ctx.fill();
				}
			}
		//}
		//this.renderSky();
	
		/*
		ctx.clearRect(0, 0, snWidth, snHeight);
		let last;
		let saved;
		let kf, bf;
		for (let x = 0; x <= snWidth; x++) {
			let data = convert(rayCast(player.a + -fov / 2 + x * fov / snWidth), x);
			if (kf === undefined) {
				saved = data;
				kf = 1;
			} else if (bf === undefined) {
				last = data;
				bf = 1;
			} else if (last.hit != saved.hit) {
				draw(saved, last);
				saved = last;
				last = data;
			} else {
				kf = round((last.y - saved.y) / (last.x - saved.x));
				bf = round(saved.y - saved.x * kf);
				if (data.x * kf + bf == data.y) {
				last = data;
				} else {
				draw(saved, last);
				saved = last;
				last = data;
				}
			}
		}
		draw(saved, last);
		*/
	}

	renderSky() {
		let gradient = this._ctx.createRadialGradient(110 * this._player.y, -90 * (this._player.x - 2), 30, 100, 100, 70);

		gradient.addColorStop(0, 'pink');
		gradient.addColorStop(.9, 'white');
		gradient.addColorStop(1, 'green');

		this._ctx.fillStyle = gradient;
		this._ctx.fillRect(20, 20, 400, 400);
	}
	
	keysUpdate() {
		let forw = 0, lr = 0;
		if (this._holdedKeys.KeyW) {
			forw += this._settings.playerSpeed;
		}
		if (this._holdedKeys.KeyS) {
			forw -= this._settings.playerSpeed;
		}
		if (this._holdedKeys.KeyA) {
			lr -= this._settings.playerSpeed;
		}
		if (this._holdedKeys.KeyD) {
			lr += this._settings.playerSpeed;
		}

		if (this._pressedKeys.KeyL) {
			this.toggleFullscreen();
		}

		if (this._pressedKeys.KeyH) {
			let instr = this._gameElem.querySelector('#instruct');
			let h = !instr.hidden;
			instr.hidden = h;
			this._controller.hidden = h;
		}
		
		if (forw || lr) {
			if (forw && lr) {
				forw /= Math.sqrt(2);
				lr /= Math.sqrt(2);
			}
			
			let sin = Math.sin(this._player.ha);
			let cos = Math.cos(this._player.ha);

			let dx = (forw * cos - lr * sin) * this._deltaTime;
			let dy = (forw * sin + lr * cos) * this._deltaTime;

			if (this._holdedKeys.ShiftLeft) {
				dx *= this._settings.multSpeed;
				dy *= this._settings.multSpeed;
			}
			//this._player.moveBy(dx, dy);

			this._tryMove(dx, dy);
		}
	}

	clearKeys() {
		let key;
		for (key in this._pressedKeys) {
			this._pressedKeys[key] = false;
		}
		for (key in this._uppedKeys) {
			this._uppedKeys[key] = false;
		}
	}

	mouseUpdate() {
		this._player.moveBy(null, null, this._mouse.dx * this._settings.gSens * this._deltaTime, this._mouse.dy * this._settings.vSens * this._deltaTime);
		this._mouse.dx = this._mouse.dy = 0;
	}

	toggleFullscreen() {
		if (document.fullscreenElement) {
			document.exitFullscreen();
			document.exitPointerLock();
		} else {
			this._gameElem.requestFullscreen();
			this._screen.requestPointerLock();
		}
	}
}

const settings = {};

const game = new Game(settings);

window.addEventListener('load', () => {
	game.init();
});