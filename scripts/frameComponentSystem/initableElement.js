class InitableElement extends HTMLElement {
    get isInit() {
        return this._isInit;
    }

    constructor() {
        super();
        this._isInit = false;
    }
        
    onConnect() {
        console.log('parent');
    }
    
    init() {}
}

class Second extends InitableElement {
    onConnect() {
        console.log('second');
    }

    connectedCallback() {
        this.onConnect();
        super.onConnect();
    }
}

class Thr extends Second {
    onConnect() {
        console.log('3');
    }
}

class Four extends Thr {
    onConnect() {
        console.log('4');
    }
}

customElements.define('my-elem', Four);

/*if (!this._isInit) {
    this.init();
    this._isInit = true;
}*/