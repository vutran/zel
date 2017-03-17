const fs = require('fs');
const url = require('url');
const path = require('path');
const https = require('https');
const pkg = require('../package');

const DOTFILE = '.zel';

/**
 * Fetches data from a URI
 *
 * @param {String} uri
 * @parm {Object} options
 * @return {Promise<String>}
 */
const get = (uri, options) => new Promise((resolve, reject) => {
    if (!uri) {
        reject('Invalid URL.');
        return;
    }

    let opts = Object.assign({}, {
        json: true,
    }, options);

    const u = url.parse(uri);
    const reqOptions = {
        protocol: u.protocol,
        hostname: u.hostname,
        path: u.path,
        headers: {
            'User-Agent': pkg.name,
        },
    };
    const req = https.get(reqOptions, (res) => {
        let data = '';
        res.on('data', (d) => {
            data += d;
        });
        res.on('end', () => {
            let d = '';
            // attempts to parse json data if necessary
            if (opts.json) {
                try {
                    d = JSON.parse(data);
                } catch (err) {
                    reject(err);
                    return;
                }
            } else {
                d = JSON.parse(data);
            }
            resolve(d);
        });
    });
    req.on('error', (e) => {
        reject(e);
    });
});

/**
 * Parse a (`.zel`) file's base64 string as JSON.
 * Customizes handler for `Unexpected Token` error
 *
 * @param  {Buffer} content - The file's contents
 * @param  {String} filepath - The file's path
 * @return {Object}
 */
const bufferToJSON = (content, filepath) => {
    try {
        return JSON.parse(
            Buffer.from(content, 'base64').toString('utf8')
        );
    } catch (err) {
        throw new Error(`Unexpected token in ${filepath}`);
    }
};

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

        const fileStream = fs.createWriteStream(file);
        https.get(downloadUrl, (resp) => {
            resp.pipe(fileStream);
        });
    });

    return files;
};

/**
 * Downloads from a Github repo
 *
 * @param {String} repoName - The repo name
 */
const downloadRepo = (repoName) => new Promise((resolve, reject) => {
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
        .catch((err) => reject(err));
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
        } catch (err) {
            reject(err.message);
        }
    });
});

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Array} - The list of local dependencies
 */
const getLocalDependencies = () => new Promise((resolve, reject) => {
    readLocalFile().then(file => {
        const deps = file.dependencies;
        return deps ? resolve(deps) : reject('No local dependencies defined. Please define a repository.');
    }).catch(err => reject(err));
});

module.exports = {
    downloadRepo,
    getLocalDependencies,
};
