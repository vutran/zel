const EventEmitter = require('events');
const { getZelFile } = require('./repository');

module.exports = class Resolver extends EventEmitter {
    /**
     * @param {Object<failFast>} failFast - Terminates if an error/invalid event occurs
     */
    constructor(options) {
        super();
        this.opts = options || {};
    }

    /**
     * Validates the repositories
     *
     * @param {Array<String>} - List of repositories
     */
    validate(repos) {
        const failFast = this.opts.failFast;

        if (!repos || !repos.length) {
            this.emit('error', 'No repositories specified.');
            if (failFast) {
                return false;
            }
        }

        if (failFast) {
            const isValid = (name) => this.emit('valid', name);
            Promise.each(repos, getZelFile)
                .then((repoNames) => repoNames.forEach(isValid))
                .catch((repoName) => this.emit('invalid', repoName));
            return;
        }

        const check = (repoName) => getZelFile(repoName)
            .then(() => this.emit('valid', repoName))
            .catch(() => this.emit('invalid', repoName));

        Promise.all(repos.map(check));
    }
};
