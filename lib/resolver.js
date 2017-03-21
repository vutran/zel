const EventEmitter = require('events');
const { getZelFile } = require('./repository');

module.exports = class Resolver extends EventEmitter {
    /**
     * @param {Array<String>} - List of repositories
     */
    constructor(repositories) {
        super();
        this.repositories = repositories || [];
        this.validateSingle = this.validateSingle.bind(this);
    }

    /**
     * Validates the repositories
     *
     * @param {Boolean} failFast - Terminates if an error/invalid event occurs
     */
    validate(failFast) {
        const ff = failFast || false;
        if (!this.repositories.length) {
            this.emit('error', 'No repositories specified.');
            if (ff) {
                return false;
            }
        }

        if (ff) {
            Promise.each(this.repositories, this.validateSingle)
                .then((repoNames) => repoNames.forEach((repoName) => this.emit('valid', repoName)))
                .catch((repoName) => this.emit('invalid', repoName));
            return;
        }

        this.repositories.forEach((repoName) => {
            this.validateSingle(repoName)
                .then((repoName) => this.emit('valid', repoName))
                .catch((repoName) => this.emit('invalid', repoName));
        });
    }

    /**
     * Validates a single repository by fetching its dotfile
     *
     * @param {String} repoName
     * @return {Promise<String>} - Resolves or reject the repo name
     */
    validateSingle(repoName) {
        return new Promise((resolve, reject) => {
            getZelFile(repoName)
                .then(() => resolve(repoName))
                .catch(() => reject(repoName));
        });
    }
};
