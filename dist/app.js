class Stats {
    _completed; _total; _el;
    constructor(total, id) {
        this._el = document.getElementById(id || 'progress');
        this._total = total;
        this.completed = 0;
    }

    set completed(val) {
        val = parseInt(val);
        this._completed = val;
        this.updateDom();
    }

    increase() {
        this.completed = this._completed + 1;
    }

    set total(val) {
        this._total = parseInt(val);
        this.updateDom();
    }

    updateDom() {
        this._el.innerText = `${this._completed}/${this._total}`;
    }

    reset() {
        this.completed = 0;
    }
}

class Origins {
    _totalOrigins = 1024;
    _startOrigin = 1;
    _found = false;
    _poetNumber = 1;

    constructor() {
        this.progress = new Stats(this._totalOrigins);
        this.cachedProgress = new Stats(this._totalOrigins,'cached');
    }

    reset() {
        this.found = false;
        this.progress.reset();
        this.cachedProgress.reset();
    }

    async start() {
        this.reset();

        this._poetNumber = this._startOrigin;
        for (this._poetNumber; this._poetNumber <= this._totalOrigins; this._poetNumber++) {
            let data;
            if (!this.cached(this._poetNumber)) {
                data = await this.fetchOrigin(this._poetNumber);
            } else {
                data = this.cached(`origin_${this._poetNumber}`);
                this.cachedProgress.increase();
            }

            if (typeof data === 'undefined') {
                this.found = false;
                break;
            }

            if (this.verify(data)) {
                this.found = true;
                break;
            }
        }

        this.done();
    }

    done() {
        if (!this._found) {
            this.found = false;
        } else {
            const dropped = document.getElementById('dropped');
            dropped.innerHTML = `<a target="_blank" href="https://opensea.io/assets/0x4b3406a41399c7fd2ba65cbc93697ad9e7ea61e5/${this._poetNumber}">View on OpenSea</a>`;
        }
    }

    get input() {
        return document.getElementById('originCode').value.trim();
    }

    set found(val) {
        val = !!val;
        this._found = val;

        if (this._found) {
            document.getElementById('result').innerHTML = `<h1>Origin ${this.input} has been dropped already.</h1>`;
        } else {
            document.getElementById('result').innerHTML = `<h1>Origin ${this.input} is still available!</h1>`;
        }
    }

    verify(data) {
        return this.getAttribute('Origin', data) === this.input;
    }

    getAttribute(key, data) {
        let result = false;
        data.attributes.forEach(item => {
            if (item?.trait_type === key) {
                result = item.value;
            }
        });

        return result;
    }

    clear() {
        let origin = 1;
        for (origin; origin <= this._totalOrigins; origin++) {
            this.clearCache(origin);
        }
    }

    clearCache(key) {
        key = (typeof key === 'string') ? key : 'origin_' + key;
        localStorage.removeItem(key);
    }

    cached(key) {
        key = (typeof key === 'string') ? key : 'origin_' + key;
        try {
            return JSON.parse(localStorage.getItem(key)) || false;
        } catch (err) {
            return false;
        }
    }

    cache(key, value) {
        key = (typeof key === 'string') ? key : 'origin_' + key;
        localStorage.setItem(key, JSON.stringify(value));
    }

    async fetchOrigin(origin) {
        return await fetch(`https://lostpoets.api.manifoldxyz.dev/metadata/${origin}`)
            .then(response => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }

                return response.json()
            })
            .then(json => {
                this.cache(origin, json);
                this.progress.increase();

                return json;
            })
            .catch((err) => {
                console.log(`Origin ${origin} not dropped yet?`);
            })
    }
}

window.OriginPoets = new Origins();
