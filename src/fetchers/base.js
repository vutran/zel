// @flow
import type { ZelConfig, FetchOptions } from '../types';
const EventEmitter = require('events');
const Promise = require('bluebird');

class BaseFetcher extends EventEmitter {
    options: FetchOptions;

    constructor(options: FetchOptions) {
        super();
        this.options = options || {};
    }

    /**
     * Fetches a configuration file
     *
     * @param {string} repoName
     * @return {Promise<ZelConfig>}
     */
    fetchConfig(repoName: string): Promise<ZelConfig> {
        return Promise.reject('Not yet implemented.');
    }
}

module.exports = BaseFetcher;
