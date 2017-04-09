// @flow

import EventEmitter from 'events';
import Promise from 'bluebird';

export default class BaseFetcher extends EventEmitter {
    /**
     * Fetches a configuration file
     *
     * @param {string} repoName
     * @return {Promise<Object>}
     */
    fetchConfig(repoName: string): Promise<any> {
        return Promise.reject('Not yet implemented.');
    }
}
