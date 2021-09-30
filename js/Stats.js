export class Stats {
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
