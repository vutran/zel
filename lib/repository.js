const { DOTFILE } = require('./constants');
const { bufferToJSON, get, sync } = require('./utils');

/**
 * Fetches the `.zel` file
 *
 * @param {String} repoName - The repo name
 * @return {Promise<Object>} - The configuration object
 */
const getZelFile = (repoName) => new Promise((resolve, reject) => {
    get(`https://api.github.com/repos/${repoName}/contents/${DOTFILE}`)
        .then((resp) => {
            if (resp.message === 'Not Found') {
                reject(`${repoName} not found.`);
            }
            const dotfile = bufferToJSON(resp.content, `"${DOTFILE}" from ${repoName}`);
            return resolve(dotfile);
        })
        .catch(err => reject(err));
});

/**
 * Downloads from a Github repo
 *
 * @param {String} repoName - The repo name
 * @return {Promise<String[]>} - The list of files that were downloaded
 */
const downloadRepo = repoName => new Promise((resolve, reject) => {
    const parts = repoName.split('/');
    if (parts.length !== 2) {
        reject('Invalid repository name. Format should be "<username>/<repository>"');
    }

    // fetches the dotfile to find the files to download
    getZelFile(repoName)
        .then((dotfile) => {
            const files = fetchFiles(repoName, dotfile.files);
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

    files.forEach((file) => {
        // @TODO - parse tag or branch name from `dependencies`
        sync(repoName, 'master', file);
    });

    return files;
};

module.exports = {
    downloadRepo,
    fetchFiles,
};
