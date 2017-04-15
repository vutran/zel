// @flow

import type { ZelConfig } from '../config';
import type { ResolvedZelConfig } from './base';
import Promise from 'bluebird';
import BaseResolver from './base';
import GitHubFetcher from '../fetchers/github';

interface ValidateOptions {
    // optional GitHub token
    token?: string;
}

export default class GithubResolver extends BaseResolver {
    constructor(options: ValidateOptions) {
        super(options);

        const fetcherOptions = {
            token: (options && options.token) || null,
        };

        this.fetcher = new GitHubFetcher(fetcherOptions);
    }

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
     * @param {Array<string>} - List of repositories
     * @return {Promise<Array<ResolvedZelConfig>>} - Resolves a list of valid/invalid config objects
     */
    validate(repos: Array<string>): Promise<Array<ResolvedZelConfig>> {
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
     * @param {string} repoName - The repository name
     * @return {Promise<ZelConfig>} - Resolves the zel config object
     */
    fetch(repoName: string): Promise<Array<ZelConfig>> {
        return this.fetcher.fetchConfig(repoName)
            .then(config => this.valid.push({ repoName, config }) && config)
            .then(config => this.fetchDependencies(config))
            .catch(err => {
                this.invalid.push({ repoName });
                Promise.reject(err);
            });
    }

    /**
     * Fetch dependencies
     *
     * @param {ZelConfig} config - The zel config object
     * @return {Array<ZelConfig>|Promise<Array<ZelConfig>>} - Resolves a list of zel config objects
     */
    fetchDependencies(config: ZelConfig): Array<ZelConfig> | Promise<Array<ZelConfig>> {
        if (config.dependencies && config.dependencies.length) {
            return Promise.all(config.dependencies.map(this.fetch, this));
        }
        return [config];
    }
}
