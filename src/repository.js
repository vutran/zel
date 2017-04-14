// @flow

import type { ZelConfig } from './config';
import type { ResolvedZelConfig } from './resolvers/base';
import { sync } from './utils';

/**
 * Fetch the list of files in the given repository,
 * and creates them in the current directory.
 *
 * @param {string} - The repository name
 * @param {ZelConfig} - The zel config object
 * @return {ZelConfig} - An object with the repository name and config
 */
export function fetchFiles(repoName: string, config: ZelConfig): ResolvedZelConfig {
    if (config.files && config.files.length) {
        config.files.forEach(file => sync(repoName, 'master', file));
    }

    return ({ repoName, config }: ResolvedZelConfig);
}
