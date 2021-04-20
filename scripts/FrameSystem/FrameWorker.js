let worker = {
    renders: {},
    render(data) {
        const results = {};
        data.inputs.forEach(inputData => {
            try {
                results[inputData.id] = this.renders[inputData.id](inputData.input);
            } catch(e) {
                console.log(e);
            }
        });
        postMessage(results);
    },
    onMessage(e) {
        if (this[e.data.method] instanceof Function) {
            this[e.data.method](e.data);
        } else {
            throw new TypeError('Unknown method ' + e.data.method);
        }
    },
    addRender(data) {
        this.renders[data.id] = emptyFunction;
        let realRender;
        Promise.all(data.imports.map(imp => import(imp))).then(impData => {
            impData.forEach(imp => {
                for (let key in imp) {
                    self[key] = imp[key];
                }
            });
            this.renders[data.id] = realRender;
        });
        realRender = (new Function('data', data.render)).bind((new Function('', data.initRender))());
    },
    deleteRender(data) {
        delete this.renders[data.id];
    }
};

worker.onMessage = worker.onMessage.bind(worker);

addEventListener('message', worker.onMessage);

function emptyFunction() {}