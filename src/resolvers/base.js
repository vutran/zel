// @flow

import type { ZelConfig } from '../config';
import EventEmitter from 'events';
import Promise from 'bluebird';

export interface ResolvedZelConfig {
    repoName: string;
    config?: ZelConfig;
}

interface ValidateOptions {
    // add options here...
}

export default class BaseResolver extends EventEmitter {
    valid: Array<ResolvedZelConfig>;
    invalid: Array<ResolvedZelConfig>;
    options: ValidateOptions;

    constructor(options: ValidateOptions) {
        super();
        this.options = options || {};
        this.valid = [];
        this.invalid = [];
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
