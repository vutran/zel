const fs = require('fs');
const url = require('url');
const path = require('path');
const https = require('https');
const mkdir = require('mkdirp');
const { name } = require('../package');

const mkdirp = Promise.promisify(mkdir);
const writeFile = Promise.promisify(fs.writeFile);

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
        return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
    } catch (err) {
        throw `Unexpected token in ${filepath}`;
    }
};

/**
 * Fetches data from a URI
 *
 * @param {String} uri
 * @parm {Object} options
 * @return {Promise<String>}
 */
const get = (uri, options) =>
    new Promise((resolve, reject) => {
        if (!uri) {
            reject('Invalid URL.');
            return;
        }

        const opts = Object.assign({ json: true }, options);

        const u = url.parse(uri);
        const reqOptions = {
            protocol: u.protocol,
            hostname: u.hostname,
            path: u.path,
            headers: {
                'User-Agent': name,
            },
        };
        const req = https.get(reqOptions, res => {
            let data = '';
            res.on('data', d => {
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
        req.on('error', e => {
            reject(e);
        });
    });

/**
 * Reads a config file
 *
 * @param {String} file - The path to the file
 * @return {Promise<Object>} - The file contents as JSON Object
 */
const getConfig = file =>
    new Promise((resolve, reject) => {
        fs.readFile(file, (err, buf) => {
            if (err && err.code === 'ENOENT') {
                return reject(`File does not exist: ${file}`);
            }
            try {
                const data = bufferToJSON(buf, file);
                resolve(data);
            } catch (msg) {
                reject(msg);
            }
        });
    });

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 *
 * @param {String} file - The full file"s path.
 * @param {String} data - The data to write.
 * @param {Object} opts - See `fs.writeFile`.
 */
const write = Promise.method((file, data, opts) => {
    file = path.normalize(file);
    const dirs = path.dirname(file);
    return mkdirp(dirs).then(() => writeFile(file, data, opts));
});

/**
 * Downloads the contents from the given repo file path components.
 *
 * @param {String} repo
 * @param {String} branch
 * @param {String} file
 */
const sync = (repo, branch, file) => {
    const uri = `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;
    https.get(uri, resp => {
        if (resp.statusCode !== 200) {
            throw `Trouble while fetching ${repo}/${branch}/${file}.`;
        }
        let data = '';
        resp.on('data', d => {
            data += d;
        });
        resp.on('end', () => write(file, data));
    });
};

module.exports = {
    bufferToJSON,
    get,
    getConfig,
    sync,
};
