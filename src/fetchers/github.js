// @flow
import type { ZelConfig, FetchOptions } from '../types';
const path = require('path');
const Promise = require('bluebird');
const CacheConf = require('cache-conf');
const { ZEL } = require('../constants');
const { bufferToJSON, get } = require('../utils');
const BaseFetcher = require('./base');

class GitHubFetcher extends BaseFetcher {
    constructor(options: FetchOptions) {
        super(options);
    }

    /**
     * Retrieve the zel configuration file from the cache if available
     *
     * @param {string} repoName - The repo name
     * @param {CacheConf} store - The cache instance
     * @return {ZelConfig|boolean} - The config object if available
     */
    fetchFromCache(repoName: string, store: CacheConf): ZelConfig | boolean {
        if (!store.has('config') || store.isExpired('config')) {
            return false;
        }

        return (store.get('config'): ZelConfig) || false;
    }

    /**
     * Fetches the zel configuration file from the GitHub repository.
     *
     * If a token is set, makes an authenticated request.
     *
     * @param {string} repoName - The repo name
     * @return {Promise<ZelConfig>} - The configuration object
     */
    fetchFromRemote(repoName: string): Promise<ZelConfig> {
        const token = this.options.token;
        return get(`https://api.github.com/repos/${repoName}/contents/${ZEL.FILE}`, {
            token,
        })
            .then(resp => resp.json())
            .then(resp => {
                if (resp.message === 'Not Found') {
                    return Promise.reject(`${repoName} not found.`);
                }
                return (bufferToJSON(
                    resp.content,
                    `"${ZEL.FILE}" from ${repoName}`
                ): ZelConfig);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Fetches the zel configuration file from cache, or GitHub API
     *
     * @param {string} repoName - The repo name
     * @return {Promise<ZelConfig>} - The configuration object
     */
    fetchConfig(repoName: string): Promise<ZelConfig> {
        const cache = new CacheConf({
            configName: ZEL.FILE,
            cwd: path.join(ZEL.CACHEDIR, repoName),
        });

        let config = this.fetchFromCache(repoName, cache);

        if (config) {
            return Promise.resolve((config: ZelConfig));
        }

        return this.fetchFromRemote(repoName)
            .then(config => {
                cache.set('config', config, { maxAge: ZEL.CACHETIMEOUT });
                return Promise.resolve(config);
            })
            .catch(err => Promise.reject(err));
    }
}

module.exports = GitHubFetcher;
