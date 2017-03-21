const path = require('path');
const { DOTFILE } = require('./constants');
const { getConfig } = require('./utils');

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Promise<String[]>} - The list of local dependencies
 */
const getLocalDependencies = () => new Promise((resolve, reject) => {
    const dotfile = path.resolve(DOTFILE);
    getConfig(dotfile)
        .then((data) => resolve(data.dependencies || []))
        .catch((err) => reject(err));
});

module.exports = {
    getLocalDependencies,
};
