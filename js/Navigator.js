export class PageNav {
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
