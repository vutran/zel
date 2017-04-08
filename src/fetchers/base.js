import EventEmitter from 'events';
import Promise from 'bluebird';

export default class BaseFetcher extends EventEmitter {
    /**
     * Fetches a configuration file
     *
     * @return {Object}
     */
    fetchConfig() {
        return Promise.reject('Not yet implemented.');
    }
}
