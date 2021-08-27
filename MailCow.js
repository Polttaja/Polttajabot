const axios = require('axios')

module.exports = class MailCow {
    constructor(API_DOMAIN, API_KEY) {
        this.API_DOMAIN = API_DOMAIN
        axios.defaults.headers.common['X-API-Key'] = API_KEY
    }

    addMailbox(mailbox) {
        return new Promise((resolve, reject) => {
            axios.post(`https://${this.API_DOMAIN}/api/v1/add/mailbox`, mailbox)
                .then((response) => resolve(response.data))
                .catch((error) => reject(error))
        })
    }

    addAlias(alias) {
        return new Promise((resolve, reject) => {
            axios.post(`https://${this.API_DOMAIN}/api/v1/add/alias`, alias)
                .then((response) => resolve(response.data))
                .catch((error) => reject(error))
        })
    }

    /**
     * Delete alias with id
     * @param {array} alias array with id of the alias(es)
     * @returns server json response
     */
    deleteAlias(alias) {
        return new Promise((resolve, reject) => {
            axios.post(`https://${this.API_DOMAIN}/api/v1/delete/alias`, alias)
                .then((response) => resolve(response.data))
                .catch((error) => reject(error))
        })
    }

    listAlias() {
        return new Promise((resolve, reject) => {
            axios.get(`https://${this.API_DOMAIN}/api/v1/get/alias/all`)
                .then((response) => resolve(response.data))
                .catch((error) => reject(error))
        })
    }
}
