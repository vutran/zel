import EventEmitter from 'events';
import Promise from 'bluebird';

export default class BaseResolver extends EventEmitter {
    constructor(options) {
        super();
        this.valid = [];
        this.invalid = [];
        this.opts = options || {};
    }

    /**
     * Validates the input list.
     *
     * If any item is invalid, should return a rejected Promise
     * of the list of invalid item.
     *
     * @param {Array<String>} - List of inputs
     * @return {Promise<Array<Object>>} - Resolves a list of valid/invalid config objects
     */
    validate(list) {
        return Promise.reject('Not yet implemented.');
    }
}
