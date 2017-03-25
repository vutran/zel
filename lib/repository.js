const { join } = require('path');
const { ZEL } = require('./constants');
const { bufferToJSON, get, sync } = require('./utils');

/**
 * Fetch the list of files in the given repository,
 * and creates them in the current directory.
 *
 * @parma {String} - The repository name
 * @param {Object} - The zel config object
 * @return {Object} - An object with the repository name and config
 */
const fetchFiles = (repoName, config) => {
    if (config.files && config.files.length) {
        config.files.forEach(file => sync(repoName, 'master', file));
    }

    return { repoName, config };
};

module.exports = {
    fetchFiles,
};
