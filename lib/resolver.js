const EventEmitter = require('events');
const { getZelFile } = require('./repository');

module.exports = class Resolver extends EventEmitter {
    constructor(options) {
        super();
        this.valid = [];
        this.invalid = [];
        this.opts = options || {};
    }

    /**
     * Validates all repositores.
     *
     * If all specified repositories are valid, returns a resolved
     * Promise that resolves a list of config objects for each
     * repository.
     *
     * If any repository is invalid, returns a rejected Promise
     * of the list of invalid repositories.
     *
     * @param {Array<String>} - List of repositories
     * @return {Promise<Array<Object>>} - Resolves a list of valid/invalid config objects
     */
    validate(repos) {
        if (!repos || !repos.length) {
            return Promise.reject('No repositories specified.');
        }

        return Promise.all(repos.map(this.fetch, this))
            .then(() => this.valid.forEach((config) => this.emit('valid', config)))
            .then(() => this.invalid.forEach((config) => this.emit('invalid', config)))
            .then(() => repos.length <= this.valid.length && !this.invalid.length)
            .then((isValid) => isValid ? this.valid : Promise.reject('Failed to validate all repositories.'))
            .catch((err) => Promise.reject(err));
    }

    /**
     * Fetch the repository and store to approriate list
     *
     * @param {String} repoName - The repository name
     * @return {Promise<Object>} - Resolves the zel config object
     */
    fetch(repoName) {
        return getZelFile(repoName)
            .then((config) => this.valid.push({ repoName, config }) && config)
            .then((config) => this.fetchDependencies(config))
            .catch(() => this.invalid.push({ repoName, config: null }));
    }

    /**
     * Fetch dependencies
     *
     * @param {Object} config - The zel config object
     * @return {Promise<Array<Object>>} - Resolves a list of zel config objects
     */
    fetchDependencies(config) {
        if (config.dependencies && config.dependencies.length) {
            return Promise.all(config.dependencies.map(this.fetch, this));
        }
        return [config];
    }
};
