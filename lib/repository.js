const { DOTFILE } = require('./constants');
const { bufferToJSON, get, sync } = require('./utils');

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

module.exports = {
    downloadRepo,
    fetchFiles,
};
