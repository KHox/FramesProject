class FrameWorker {
    constructor() {
        this.onMainWorker = this.onMainWorker.bind(this);
        this.onPreWorker = this.onPreWorker.bind(this);
        
        addEventListener('message', this.onPreWorker);
    }
    
    onMainWorker(e) {
        let func = this[e.data.type];
        if (func instanceof Function) {
            func(e.data);
        } else {
            throw new TypeError('Unknown type');
        }
    }
    
    onPreWorker(e) {
        if (e.data.type == 'main') {
            removeEventListener('message', this.onPreWorker);
            addEventListener('message', this.onMainWorker);

            this.addComponent = this.addComponent.bind(this);
            this.removeComponent = this.removeComponent.bind(this);
            this.render = this.render.bind(this);

            this._workers = [];

            for (let i = 0; i < navigator.hardwareConcurrency; i++) {
                let nw = new Worker('../FrameWorker.js');
                nw.postMessage({type: 'helper'});
                this._workers.push(nw);
            }

            this._renders = [];
        } else {
            throw new TypeError('Unknown type');
        }
    }

    addComponent(data) {
        while (!this._renders.hasOwnProperty(data.index)) {
            this._renders.push(null);
        }

        if (data.renderBody) {
            this._renders[data.index] = new Function('data', data.renderBody);

            if (data.initRenderBody) {
                this._renders[data.index] = this._renders[data.index].bind((new Function('', data.initRenderBody))());
            }
        }
    }

    removeComponent(data) {
        this._renders.splice(data.index, 1);
    }

    render(data) {
        let length = Math.min(data.renderData.length, this._renders.length);
        let answer = new Array(length);

        for (let i = 0; i < length; i++) {
            const render = this._renders[i];
            const rendData = data.renderData[i];
            if (rendData !== undefined && render) {
                answer[i] = render(rendData);
            }
        }
        postMessage(answer);
    }
}

let worker = new FrameWorker();
