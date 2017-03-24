const EventEmitter = require('events');

module.exports = class BaseFetcher extends EventEmitter {
    /**
     * Fetches a configuration file
     *
     * @return {Object}
     */
    fetchConfig() {
        return Promise.reject('Not yet implemented.');
    }
};
