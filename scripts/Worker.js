importScripts('Map.js');

const map = new GameMap(0.1, 4);


onmessage = e => {
    let req = e.data;

    if (req.type == 'rayCastAll') {
        let hits = new Array(req.snWidth + 1);
        let leftFov = req.ha - req.hFov / 2;
		let k = req.hFov / req.snWidth;
        let tan = Math.tan(req.halfVFov);
        
		for (let x = 0; x <= req.snWidth; x++) {
            let angle = leftFov + x * k;
			hits[x] = map.rayCast(req.x, req.y, angle, 64);
            if (hits[x].hit) {
                hits[x].topOffset = (1 - hits[x].cell.height / 2 / hits[x].distance / tan / Math.cos(angle - req.ha)) / 2;
            }
		}
        
        postMessage(hits);
    } else if (req.type == 'rayCastOnce') {
        postMessage(map.rayCast(req.x, req.y, req.a, 64));
    } else if (req.type == 'tryMoveBy') {
        let l1 = req.dx != 0 ? (req.dx < 0 ? Math.min(req.dx, -0.05) : Math.max(req.dx, 0.05)) : null;
        let l2 = req.dy != 0 ? (req.dy < 0 ? Math.min(req.dy, -0.05) : Math.max(req.dy, 0.05)) : null;

        if (l1 && map.rayCast(req.x, req.y, 0, l1).hit) {
            req.dx = 0;
        }
        if (l2 && map.rayCast(req.x, req.y, Math.PI / 2, l2).hit) {
            req.dy = 0;
        };

        postMessage(req);
    } else {
        postMessage(e.data);
    }
};
		