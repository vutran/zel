import Promise from 'bluebird';
import BaseResolver from './base';
import GitHubFetcher from '../fetchers/github';

const fetcher = new GitHubFetcher();

export default class GithubResolver extends BaseResolver {
    /**
     * Validates the given list of repositories.
     *
     * If all specified repositories are valid, returns a resolved
     * Promise that resolves a list of config objects for each
     * repository.
     *
     * If any repository is invalid, should return a rejected Promise
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
            .then(() => this.valid.forEach(config => this.emit('valid', config)))
            .then(() => this.invalid.forEach(config => this.emit('invalid', config)))
            .then(() => repos.length <= this.valid.length)
            .then(isValid => isValid ? this.valid : Promise.reject(this.invalid))
            .catch(err => Promise.reject(err));
    }

    /**
     * Fetch the repository and store to approriate list
     *
     * @param {String} repoName - The repository name
     * @return {Promise<Object>} - Resolves the zel config object
     */
    fetch(repoName) {
        return fetcher.fetchConfig(repoName)
            .then(config => this.valid.push({ repoName, config }) && config)
            .then(config => this.fetchDependencies(config))
            .catch(err => this.invalid.push({ repoName, config: null }) && Promise.reject(err));
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
}
