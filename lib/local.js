const path = require('path');
const { DOTFILE } = require('./constants');
const { bufferToJSON, getConfig } = require('./utils');

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Promise<String[]>} - The list of local dependencies
 */
const getLocalDependencies = () => new Promise((resolve, reject) => {
    const dotfile = path.resolve(DOTFILE);
    getConfig(dotfile)
        .then((data) => {
            const deps = data.dependencies;
            return deps ? resolve(deps) : reject('No local dependencies defined. Please define a repository.');
        })
        .catch((err) => reject(err));
});

module.exports = {
    getLocalDependencies,
};
