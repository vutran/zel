// @flow

import type { ZelConfig } from '../config';
import type { ResolvedZelConfig, ValidateOptions } from './base';
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
     * @param {Array<string>} - List of repositories
     * @param {ValidateOptions} - Dictionary of validation options
     * @return {Promise<Array<ResolvedZelConfig>>} - Resolves a list of valid/invalid config objects
     */
    validate(repos: Array<string>, options: ValidateOptions): Promise<Array<ResolvedZelConfig>> {
        if (!repos || !repos.length) {
            return Promise.reject('No repositories specified.');
        }

        return Promise.all(repos.map(repo => this.fetch(repo, options), this))
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
     * @param {FetchOptions} options - Dictionary of fetch options
     * @return {Promise<ZelConfig>} - Resolves the zel config object
     */
    fetch(repoName: string, options: FetchOptions): Promise<Array<ZelConfig>> {
        return fetcher.fetchConfig(repoName, options)
            .then(config => this.valid.push({ repoName, config }) && config)
            .then(config => this.fetchDependencies(config, options))
            .catch(err => {
                this.invalid.push({ repoName });
                Promise.reject(err);
            });
    }

    /**
     * Fetch dependencies
     *
     * @param {ZelConfig} config - The zel config object
     * @param {FetchOptions} options - Dictionary of fetch options
     * @return {Array<ZelConfig>|Promise<Array<ZelConfig>>} - Resolves a list of zel config objects
     */
    fetchDependencies(config: ZelConfig, options: FetchOptions): Array<ZelConfig> | Promise<Array<ZelConfig>> {
        if (config.dependencies && config.dependencies.length) {
            return Promise.all(config.dependencies.map(dep => this.fetch(dep, options), this));
        }
        return [config];
    }
}
