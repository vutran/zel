// @flow

import { join } from 'path';
import { ZEL } from './constants';
import { bufferToJSON, get, sync } from './utils';

/**
 * Fetch the list of files in the given repository,
 * and creates them in the current directory.
 *
 * @param {string} - The repository name
 * @param {Object} - The zel config object
 * @return {Object} - An object with the repository name and config
 */
export function fetchFiles(repoName: string, config: Object) {
    if (config.files && config.files.length) {
        config.files.forEach(file => sync(repoName, 'master', file));
    }

    return { repoName, config };
}
