window.addEventListener('load', () => {
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

	async function render() {
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
		drawSky(data1, data2, c);
		drawFloor(data1, data2, c);
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
          req.call(document.body);
        } else {
          req = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen;
          req.call(document);
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

function getMap() {
	let map = '';
	map += '###############';
	map += '#p.#..........#';
	map += '#..#.####.###.#';
	map += '#.....#....#..#';
	map += '#.###.####.#.##';
	map += '#.#.#..#......#';
	map += '#...##.#.###.##';
	map += '#.####.#..#..##';
	map += '#......#..#.###';
	map += '########..#.#?#';
	map += '#....#....#...#';
	map += '#..#...####.#.#';
	map += '###############';
	return {
		width: 15,
		height: 15,
		arr: map
	};
}
