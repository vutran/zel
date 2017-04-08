import fs from 'fs';
import url from 'url';
import path from 'path';
import https from 'https';
import mkdir from 'mkdirp';
import Promise from 'bluebird';
import { name } from '../package';

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
export function bufferToJSON(content, filepath) {
    try {
        return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
    } catch (err) {
        throw `Unexpected token in ${filepath}`;
    }
}

/**
 * Fetches data from a URI
 *
 * @param {String} uri
 * @parm {Object} options
 * @return {Promise<String>}
 */
export function get(uri, options) {
    return new Promise((resolve, reject) => {
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
}

/**
 * Reads a config file
 *
 * @param {String} file - The path to the file
 * @return {Promise<Object>} - The file contents as JSON Object
 */
export function getConfig(file) {
    return new Promise((resolve, reject) => {
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
}

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 *
 * @param {String} file - The full file"s path.
 * @param {String} data - The data to write.
 * @param {Object} opts - See `fs.writeFile`.
 */
export const write = Promise.method((file, data, opts) => {
    file = path.normalize(file);
    const dirs = path.dirname(file);
    console.log(file, dirs);
    return mkdirp(dirs).then(() => writeFile(file, data, opts));
});

/**
 * Downloads the contents from the given repo file path components.
 *
 * @param {String} repo
 * @param {String} branch
 * @param {String} file
 */
export function sync(repo, branch, file) {
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
}
