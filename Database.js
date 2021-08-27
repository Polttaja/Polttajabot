const fs = require('fs');

module.exports = class Database {
    constructor(file) {
        this.file = file
        if (fs.existsSync(file))
            this.data = JSON.parse(fs.readFileSync(file, {encoding:'utf8', flag:'r'}))
        else
            this.data = new Object()
    }

    save() {
        fs.writeFileSync(this.file, JSON.stringify(this.data));
    }

    // TODO: does not work

    /**
     * Add new user to database
     * @param {int} id - Telegram user id
     * @param {string} name - Telegram username
     * @returns {boolean} Returns false when user exists and true when it does not 
     */
    addUser(id, name, password) {
        if (id in this.data)
            return false
        this.data[id] = {
            "main": name,
            "password": password,
            "alias": []
        }
        return true
    }

    addAlias(id, localPart) {
        this.data[id]["alias"].push(localPart)
    }

    getUser(id) {
        if (id in this.data)
            return this.data[id]["main"]
        return false
    }

    getAlias(id) {
        if (id in this.data)
            return this.data[id]["alias"]
        return false
    }

    deleteAlias(userId, localPart) {
        const arrWithRemovedAlias = this.data[userId]["alias"].filter(alias => alias != localPart)
        this.data[userId]["alias"] = arrWithRemovedAlias
    }

    debug() {
        console.log(this.data)
    }
}