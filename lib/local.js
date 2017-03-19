const fs = require('fs');
const path = require('path');
const { DOTFILE } = require('./constants');
const { bufferToJSON } = require('./utils');

/**
 * Read a local `.zel` file (from cwd)
 *
 * @return {Promise<Object>} - The file contents as JSON Object
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
 * @return {Promise<String[]>} - The list of local dependencies
 */
const getLocalDependencies = () => new Promise((resolve, reject) => {
    readLocalFile().then((file) => {
        const deps = file.dependencies;
        return deps ? resolve(deps) : reject('No local dependencies defined. Please define a repository.');
    }).catch(err => reject(err));
});

module.exports = {
    readLocalFile,
    getLocalDependencies,
};
