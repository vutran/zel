// @flow

import type { ZelConfig } from '../config';
import EventEmitter from 'events';
import Promise from 'bluebird';

export interface ResolvedZelConfig {
    repoName: string;
    config?: ZelConfig;
}

export interface ValidateOptions {
    // optional GitHub token
    token?: string;
}

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
     * @param {ValidateOptions} - Dictionary of validation options
     * @return {Promise<Array<ResolvedZelConfig>>} - Resolves a list of resolved valid/invalid config objects
     */
    validate(list: Array<string>, options: ValidateOptions): Promise<Array<ResolvedZelConfig>> {
        return Promise.reject('Not yet implemented.');
    }
}
