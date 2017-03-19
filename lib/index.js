const fs = require('fs');
const path = require('path');
const https = require('https');
const { DOTFILE } = require('./constants');
const { bufferToJSON, get, sync } = require('./utils');

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
        throw new Error('No files found.');
    }

    files.forEach((file) => {
        const downloadUrl = `https://raw.githubusercontent.com/${repoName}/master/${file}`;
        sync(downloadUrl, file);
    });

    return files;
};

/**
 * Downloads from a Github repo
 *
 * @param {String} repoName - The repo name
 */
const downloadRepo = repoName => new Promise((resolve, reject) => {
    const parts = repoName.split('/');
    if (parts.length !== 2) {
        throw new Error('Invalid repository name. Format should be "<username>/<repository>"');
    }

    // fetches the dotfile to find the files to download
    get(`https://api.github.com/repos/${repoName}/contents/${DOTFILE}`)
        .then((resp) => {
            if (resp.message === 'Not Found') {
                reject({ message: resp.message });
            }
            const dotfile = bufferToJSON(resp.content, `"${DOTFILE}" from ${repoName}`);
            const files = fetchFiles(repoName, dotfile.files);
            // @TODO read remote dependencies
            resolve(files);
        })
        .catch(err => reject(err));
});

/**
 * Read a local `.zel` file (from cwd)
 *
 * @return {Object} - The file contents as JSON Object
 */
const readLocalFile = () => new Promise((resolve, reject) => {
    const dotfile = path.resolve(DOTFILE);

    fs.readFile(dotfile, (err, buf) => {
        if (err && err.code === 'ENOENT') {
            return reject('A `.zel` file does not exist in this directory.');
        }
        try {
            const data = bufferToJSON(buf, dotfile);
            resolve(data);
        } catch (err2) {
            reject(err2.message);
        }
    });
});

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Array} - The list of local dependencies
 */
const getLocalDependencies = () => new Promise((resolve, reject) => {
    readLocalFile().then((file) => {
        const deps = file.dependencies;
        return deps ? resolve(deps) : reject('No local dependencies defined. Please define a repository.');
    }).catch(err => reject(err));
});

module.exports = {
    downloadRepo,
    getLocalDependencies,
};
