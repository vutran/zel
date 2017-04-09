// @flow

import path from 'path';
import Promise from 'bluebird';
import CacheConf from 'cache-conf';
import { ZEL } from '../constants';
import { bufferToJSON, get } from '../utils';
import BaseFetcher from './base';

export default class GitHubFetcher extends BaseFetcher {
    /**
     * Retrieve the zel configuration file from the cache if available
     *
     * @param {string} repoName - The repo name
     * @param {CacheConf} store - The cache instance
     * @return {Object|boolean} - The config object if available
     */
    fetchFromCache(repoName: string, store: CacheConf): Object | boolean {
        if (!store.has('config') || store.isExpired('config')) {
            return false;
        }

        return store.get('config') || false;
    }

    /**
     * Fetches the zel configuration file from the GitHub repository.
     *
     * @param {string} repoName - The repo name
     * @return {Promise<Object>} - The configuration object
     */
    fetchFromRemote(repoName: string): Promise<Object> {
        return get(`https://api.github.com/repos/${repoName}/contents/${ZEL.FILE}`)
            .then(resp => {
                if (resp.message === 'Not Found') {
                    return Promise.reject(`${repoName} not found.`);
                }
                return bufferToJSON(resp.content, `"${ZEL.FILE}" from ${repoName}`);
            })
            .catch(err => Promise.reject(err));
    }

    /**
     * Fetches the zel configuration file from cache, or GitHub API
     *
     * @param {string} repoName - The repo name
     * @return {Promise<Object>} - The configuration object
     */
    fetchConfig(repoName: string): Promise<any> {
        const cache = new CacheConf({
            configName: ZEL.FILE,
            cwd: path.join(ZEL.CACHEDIR, repoName),
        });

        let config = this.fetchFromCache(repoName, cache);

        if (config) {
            return Promise.resolve(config);
        }

        return this.fetchFromRemote(repoName)
            .then(config => {
                cache.set('config', config, { maxAge: ZEL.CACHETIMEOUT });
                return Promise.resolve(config);
            })
            .catch(err => Promise.reject(err));
    }
}
