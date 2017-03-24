const { join } = require('path');
const CacheConf = require('cache-conf');
const GitHubFetcher = require('./fetchers/github-fetcher');
const { ZEL } = require('./constants');
const { sync } = require('./utils');

/**
 * Retrieve the zel configuration of the specified repository name.
 *
 * Config are cached into the `ZEL.CACHEDIR` directory
 * and expires with a timeout set to `ZEL.CACHETIMEOUT`.
 *
 * @param {String} repoName - The repo name
 * @return {Promise<Object>} - The configuration object
 */
const getZelFile = (repoName) => new Promise((resolve, reject) => {
    const cache = new CacheConf({
        configName: ZEL.FILE,
        cwd: join(ZEL.CACHEDIR, repoName),
    });

    if (cache.isExpired('config') || !cache.has('config')) {
        return new GitHubFetcher()
            .fetchConfig(repoName)
                .then((config) => {
                    cache.set('config', config, { maxAge: ZEL.CACHETIMEOUT });
                    resolve(config);
                })
                .catch((err) => reject(err));
    }

    const config = cache.get('config');

    if (config === undefined) {
        return reject('Invalid repository.');
    }

    resolve(config);
});

/**
 * Fetch the list of files in the given repository,
 * and creates them in the current directory.
 *
 * @param {String} - The repository name
 * @param {Object} - The zel config object
 * @return {Object} - An object with the repository name and config
 */
const fetchFiles = (repoName, config) => {
    if (config.files && config.files.length) {
        config.files.forEach((file) => sync(repoName, 'master', file));
    }

    return { repoName, config };
};

module.exports = {
    getZelFile,
    fetchFiles,
};
