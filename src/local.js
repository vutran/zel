// @flow
const path = require('path');
const Promise = require('bluebird');
const { ZEL } = require('./constants');
const { getConfig } = require('./utils');

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Promise<Array<string>>} - The list of local dependencies
 */
function getLocalDependencies() {
    return new Promise((resolve, reject) => {
        const dotfile = path.resolve(ZEL.FILE);
        getConfig(dotfile)
            .then(data => resolve(data.dependencies || []))
            .catch(err => reject(err));
    });
}

module.exports = { getLocalDependencies };
