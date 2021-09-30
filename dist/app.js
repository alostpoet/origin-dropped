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
    }

    reset() {
        this.found = false;
        this.progress.reset();
    }

    async findByOsLink() {
        this.reset();
        pageNav.to('retrievePoetPage');

        const poetNumber = document.getElementById('osLink').value.trim().split('/').pop();
        let data = await this.fetchOrigin(poetNumber);
        console.log('Retrieved poet', data);

        const origin = this.getAttribute('Origin', data);
        console.log('Got Origin', origin);
        document.getElementById('originCode').value = origin;

        return this.start();
    }

    async start() {
        this.reset();
        pageNav.to('noCachePage');

        this._poetNumber = this._startOrigin;
        for (this._poetNumber; this._poetNumber <= this._totalOrigins; this._poetNumber++) {
            let data;
            if (!this.cached(this._poetNumber)) {
                data = await this.fetchOrigin(this._poetNumber);
            } else {
                data = this.cached(`origin_${this._poetNumber}`);
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

        pageNav.to('results');
        document.getElementById('originCode').value = '';
    }

    get input() {
        return document.getElementById('originCode').value.trim().toUpperCase();
    }

    set found(val) {
        val = !!val;
        this._found = val;

        if (this._found) {
            document.getElementById('result').innerHTML = `<h1>Origin #${this.input} has been dropped already.</h1>`;
        } else {
            document.getElementById('result').innerHTML = `<h1>Origin #${this.input} is still available!</h1>`;
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

        pageNav.to('startPage');
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

class PageNav {
    _pages; _currentPage; _previousPage;
    constructor() {
        this._pages = document.querySelectorAll('.page');
        this.currentPage = this._pages[0];
    }

    to(pageId) {
        this.currentPage = pageId;
    }

    set currentPage(val) {
        val = (typeof val === 'string') ? document.getElementById(val) : val;

        if (this._currentPage) {
            this._currentPage.classList.remove('show');
            this._previousPage = this._currentPage;
        }

        this._currentPage = val;
        this._currentPage.classList.add('show');
    }

    back() {
        this.currentPage = this._previousPage;
    }

    get currentPage() {
        return this._currentPage;
    }
}

window.OriginPoets = new Origins();
window.pageNav = new PageNav();
