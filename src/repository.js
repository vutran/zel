// @flow
import type { ResolvedZelConfig, ZelConfig } from './types';
const { sync } = require('./utils');

/**
 * Fetch the list of files in the given repository,
 * and creates them in the current directory.
 *
 * @param {string} - The repository name
 * @param {string} - Write target directory
 * @param {ZelConfig} - The zel config object
 * @return {ZelConfig} - An object with the repository name and config
 */
function fetchFiles(
    repoName: string,
    target: string,
    config: ZelConfig
): ResolvedZelConfig {
    if (config.files && config.files.length) {
        config.files.forEach(file => sync(repoName, 'master', file, target));
    }

    return ({ repoName, config }: ResolvedZelConfig);
}

module.exports = { fetchFiles };
