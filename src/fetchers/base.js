// @flow

import type { ZelConfig } from '../config';
import EventEmitter from 'events';
import Promise from 'bluebird';

export default class BaseFetcher extends EventEmitter {
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
