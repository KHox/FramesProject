export { EventableElement } from "./ComponentBase/EventableElement.js";
export { FrameRenderableComponent } from "./ComponentBase/FrameRenderableComponent.js";
import { Frame, FrameComponent } from "./Frame.js";
export { Frame, FrameComponent };
export { SwitchableElement } from "./SwitchableElement.js";

let updatesId, fpsId;
let isStoped = true;
let noFullscreened = true;

/**
 * @type {Frame}
 */
let currentFocused;

/**
 * @type {Array<Frame>}
 */
const openedFrames = [];
/**
 * @type {Array<Frame>}
 */
const activeFrames = [];


function checkForStart() {
    if (isStoped && activeFrames.length) {
        isStoped = false;

        updatesId = setInterval(mactroTask);
        fpsId = requestAnimationFrame(frameUpdate);
    }
}

function mactroTask() {
    if (activeFrames.length == 0) {
        return stopUpdates();
    }
    
    if (noFullscreened) {
        let start = performance.now();
        do {
            iter();
        } while ((performance.now() - start) < 0.3);
    } else if (currentFocused && currentFocused.isFullscreened && currentFocused.isOn) {
        let start = performance.now();
        do {
            currentFocused.tick();
        } while ((performance.now() - start) < 0.3);
    }
}

function iter() {
    activeFrames.forEach(fd => {
        fd.frame.tick();
        fd.updated = true;
    });
}

function frameUpdate() {
    fpsId = requestAnimationFrame(frameUpdate);

    if (noFullscreened) {
        activeFrames.forEach(fd => {
            if (fd.updated) {
                fd.frame.render();
                fd.updated = false;
            }
        });
    } else if (currentFocused && currentFocused.isFullscreened && currentFocused.isOn) {
        currentFocused.render();
    }
}

function stopUpdates() {
    isStoped = true;
    clearInterval(updatesId);
    cancelAnimationFrame(fpsId);
}

async function addActiveFrame(frame) {
    return Promise.resolve().then(() => {
        activeFrames.push({
            frame,
            time: 0,
            updated: false
        });

        checkForStart();
    });
}

function removeActiveFrame(frame) {
    return Promise.resolve().then(() => {
        activeFrames.delete(activeFrames.find(fd => fd.frame == frame));
    });
}

async function setFocus(frame) {
    if (frame !== currentFocused) {
        if (currentFocused) {
            if (currentFocused.isFullscreened) {
                await currentFocused.fullsceenOff();
            }
            currentFocused.onBlur();
        }

        if (frame) {
            frame.onFocus();
        }

        currentFocused = frame;
    }
}

function nextFrame() {
    let ind = openedFrames.indexOf(currentFocused) + 1;
    if (ind == openedFrames.length) {
        ind = 0;
    }

    setFocus(openedFrames[ind]);
}

document.addEventListener('open', e => {
    const t = e.target;
    if (t instanceof Frame) {
        if (openedFrames.includes(t)) {
            throw new TypeError('Frame already open');
        } else {
            openedFrames.push(t);
            setFocus(t);
            if (t.isOn) {
                addActiveFrame(t);
            }
        }
    }
});

document.addEventListener('switchOff', e => {
    const t = e.target;
    if (t instanceof Frame && openedFrames.includes(t)) {
        removeActiveFrame(t);
    }
});

document.addEventListener('switchOn', e => {
    const t = e.target;
    if (t instanceof Frame && openedFrames.includes(t)) {
        addActiveFrame(t);
    }
});

addEventListener('resize', e => {
    openedFrames.forEach(f => f.resize());
});

document.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (currentFocused) {
        currentFocused.keyDown(e.code);
        if (e.altKey && e.code == 'Enter') {
            currentFocused.toggleFullscreen();
        }

        if (e.code == 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                nextFrame();
            }
        }
    }
});

document.addEventListener('keyup', e => {
    if (currentFocused) {
        currentFocused.keyUp(e.code);
    }
});

document.addEventListener('mousemove', e => {
    handleEvent(e, 'mouseMove');
});

document.addEventListener('mousedown', e => {
    const frame = e.target.closest('frame-element');

    setFocus(frame);

    handleEvent(e, 'mouseDown');
});

document.addEventListener('mouseup', e => {
    handleEvent(e, 'mouseUp');
});

function handleEvent(e, name) {
    if (currentFocused) {
        const {left, top} = currentFocused.getBoundingClientRect();
        currentFocused[name](
            e.clientX - left,
            e.clientY - top,
            e.buttons,
            e
        );
    }
}

document.addEventListener('click', e => {
});


document.addEventListener('fullscreenchange', async e => {
    if (document.fullscreenElement) {
        noFullscreened = false;
        if (document.fullscreenElement instanceof Frame) {
            setFocus(document.fullscreenElement);
        }
    } else {
        if (currentFocused && currentFocused.isFullscreened) {
            await currentFocused.fullsceenOff();
        }
        noFullscreened = true;
    }
});