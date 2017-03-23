const { join } = require('path');
const CacheConf = require('cache-conf');
const { ZEL } = require('./constants');
const { bufferToJSON, get, sync } = require('./utils');

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

    if (cache.isExpired() || !cache.has('config')) {
        return fetchZelFile(repoName)
            .then((config) => {
                cache.set('config', config, { maxAge: ZEL.CACHETIMEOUT });
                resolve(config);
            })
            .catch((err) => reject(err));
    }

    const config = cache.get('config');

    resolve(config);
});

/**
 * Fetches the zel configuration file from the remote repository.
 *
 * @param {String} repoName - The repo name
 * @return {Promise<Object>} - The configuration object
 */
const fetchZelFile = (repoName) => new Promise((resolve, reject) => {
    get(`https://api.github.com/repos/${repoName}/contents/${ZEL.FILE}`)
        .then((resp) => {
            if (resp.message === 'Not Found') {
                reject(`${repoName} not found.`);
            }
            const config = bufferToJSON(resp.content, `"${ZEL.FILE}" from ${repoName}`);
            resolve(config);
        })
        .catch((err) => reject(err));
});

/**
 * Fetch the list of files in the given repository, and creates them
 * in the current directory.
 *
 * @parma {String} - The repository name
 * @param {Object} - The zel config object
 * @return {Object} - An object with the repository name and config
 */
const fetchFiles = (repoName, config) => {
    if (!config.files) {
        throw `No files specified in ${repoName}.`;
    }

    // @TODO - parse tag or branch name from `dependencies`
    config.files.forEach((file) => sync(repoName, 'master', file));

    return { repoName, config };
};

module.exports = {
    getZelFile,
    fetchFiles,
};
