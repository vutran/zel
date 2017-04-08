import path from 'path';
import Promise from 'bluebird';
import { ZEL } from './constants';
import { getConfig } from './utils';

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Promise<String[]>} - The list of local dependencies
 */
export function getLocalDependencies() {
    return new Promise((resolve, reject) => {
        const dotfile = path.resolve(ZEL.FILE);
        getConfig(dotfile)
            .then(data => resolve(data.dependencies || []))
            .catch(err => reject(err));
    });
}
