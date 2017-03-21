const EventEmitter = require('events');
const { getZelFile } = require('./repository');

module.exports = class Resolver extends EventEmitter {
    /**
     * @param {Array<String>} - List of repositories
     */
    constructor(repositories) {
        super();
        this.repositories = repositories || [];
    }

    /**
     * Validates the repositories
     *
     * @param {Boolean} failFast - Terminates if an error/invalid event occurs
     */
    validate(failFast) {
        if (!this.repositories.length) {
            this.emit('error', 'No repositories specified.');
            if (failFast) {
                return false;
            }
        }

        if (failFast) {
            Promise.each(this.repositories, this.validateSingle)
                .then((repoNames) => repoNames.forEach((repoName) => this.emit('valid', repoName)))
                .catch((repoName) => this.emit('invalid', repoName));
            return;
        }

        this.repositories.forEach((repoName) => {
            getZelFile(repoName)
                .then(() => this.emit('valid', repoName))
                .catch(() => this.emit('invalid', repoName));
        });
    }
};
