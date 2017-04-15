// @flow

import type { ZelConfig } from '../types';
import EventEmitter from 'events';
import Promise from 'bluebird';

export default class BaseResolver extends EventEmitter {
    valid: Array<ResolvedZelConfig>;
    invalid: Array<ResolvedZelConfig>;
    opts: any;

    constructor(options: any) {
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
     * @param {Array<string>} - List of inputs
     * @return {Promise<Array<ResolvedZelConfig>>} - Resolves a list of resolved valid/invalid config objects
     */
    validate(list: Array<string>): Promise<Array<ResolvedZelConfig>> {
        return Promise.reject('Not yet implemented.');
    }
}
