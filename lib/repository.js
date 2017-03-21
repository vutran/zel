const path = require('path');
const CacheConf = require('cache-conf');
const { DOTFILE, ZEL_CACHEDIR, ZEL_CACHETIMEOUT } = require('./constants');
const { bufferToJSON, get, sync } = require('./utils');

/**
 * Retrieve the zel configuration of the specified repository name.
 *
 * Config are cached into the `ZEL_CACHEDIR` directory
 * and expires with a timeout set to `ZEL_CACHETIMEOUT`.
 *
 * @param {String} repoName - The repo name
 * @return {Promise<Object>} - The configuration object
 */
const getZelFile = (repoName) => new Promise((resolve, reject) => {
    const cache = new CacheConf({
        configName: DOTFILE,
        cwd: path.resolve(ZEL_CACHEDIR, repoName),
    });

    if (cache.isExpired() || !cache.has('config')) {
        return fetchZelFile(repoName)
            .then((config) => {
                cache.set('config', config, { maxAge: ZEL_CACHETIMEOUT });
                resolve(config);
            })
            .catch(err => reject(err));
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
    get(`https://api.github.com/repos/${repoName}/contents/${DOTFILE}`)
        .then((resp) => {
            if (resp.message === 'Not Found') {
                reject(`${repoName} not found.`);
            }
            const config = bufferToJSON(resp.content, `"${DOTFILE}" from ${repoName}`);
            resolve(config);
        })
        .catch((err) => reject(err));
});

/**
 * Downloads from a Github repo
 *
 * @param {String} repoName - The repo name
 * @return {Promise<String[]>} - The list of files that were downloaded
 */
const downloadRepo = (repoName) => new Promise((resolve, reject) => {
    const parts = repoName.split('/');
    if (parts.length !== 2) {
        reject('Invalid repository name. Format should be "<username>/<repository>"');
    }

    // fetches the dotfile to find the files to download
    getZelFile(repoName)
        .then((config) => {
            const files = fetchFiles(repoName, config.files);
            // @TODO read remote dependencies
            resolve(files);
        })
        .catch(err => reject(err));
});

/**
 * Fetch the list of files in the given repository, and creates them
 * in the current directory.
 *
 * @param {String} repoName - The full repo name (username/repository)
 * @param {Array<String>} files - A list of files
 * @return {Array<String>} - The files downloaded
 */
const fetchFiles = (repoName, files) => {
    if (!files) {
        throw `No files specified in ${repoName}.`;
    }

    // @TODO - parse tag or branch name from `dependencies`
    files.forEach((file) => sync(repoName, 'master', file));

    return files;
};

module.exports = {
    getZelFile,
    downloadRepo,
    fetchFiles,
};
