module.exports = function Paginate(req, count) {

    this.page = parseInt(req.query.page)
    this.limit = parseInt(req.query.limit)
    this.startIndex = (this.page - 1) * this.limit
    this.nextPage = {}
    this.previousPage = {}
    this.endIndex = this.page * this.limit
    this.count = count


this.checkNextPage = () => {
    if (this.endIndex < this.count) {
        this.nextPage = {
            page: this.page + 1,
            limit: this.limit,
            // url: req.protocol + '://' + req.get('host') + req.baseUrl
            url: `${req.protocol}://${req.get('host')}${req.originalUrl.split('?').shift()}?page=${this.page + 1}&limit=${this.limit}`
        }
    }
    return this.nextPage
}

this.checkPreviousPage = () => {
    if (this.startIndex > 0) {
        this.previousPage = {
            page: this.page - 1,
            limit: this.limit,
            url: `${req.protocol}://${req.get('host')}${req.originalUrl.split('?').shift()}?page=${this.page - 1}&limit=${this.limit}`
        }
    }
    return this.previousPage
}
}

class Pagination {
constructor(count) {
    this.page = parseInt(req.query.page)
    this.limit = parseInt(req.query.limit)
    this.startIndex = (this.page - 1) * this.limit
    this.nextPage = {}
    this.previousPage = {}
    this.endIndex = this.page * this.limit
    this.count = count
}

checkNextPage() {
    if (this.endIndex < this.count) {
        this.nextPage = {
            page: this.page + 1,
            limit: this.limit,
            // url: req.protocol + '://' + req.get('host') + req.baseUrl
            url: `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${this.page + 1}&limit=${this.limit}`
        }
    }
    return this.nextPage
}

checkPreviousPage() {
    if (this.startIndex > 0) {
        this.previousPage = {
            page: this.page - 1,
            limit: this.limit,
            url: `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${this.page - 1}&limit=${this.limit}`
        }
    }
    return this.previousPage
}

}