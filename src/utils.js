// @flow

import type { ZelConfig } from './config';
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
 * @param Buffer} content - The file's contents
 * @param {string} filepath - The file's path
 * @return {Object}
 */
export function bufferToJSON(content: Buffer, filepath: string): Object {
    try {
        return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
    } catch (err) {
        throw `Unexpected token in ${filepath}`;
    }
}

/**
 * Fetches data from a URI
 *
 * @param {string} uri
 * @param {Object} options
 * @return {Promise<T>}
 */
export function get<T: any>(uri: string, options: any): Promise<T> {
    return new Promise((resolve, reject) => {
        if (!uri) {
            reject('Invalid URL.');
            return;
        }

        const opts = Object.assign(
            {
                json: false,
                token: null,
            },
            options
        );

        const u = url.parse(uri);
        const reqOptions = {
            protocol: u.protocol,
            hostname: u.hostname,
            path: u.path,
            headers: {
                'User-Agent': name,
            },
        };

        if (opts.token) {
            reqOptions.headers.Authorization = `token ${opts.token}`;
        }

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
                    d = data;
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
 * @param {string} file - The path to the file
 * @return {Promise<ZelConfig>} - The file contents as JSON Object
 */
export function getConfig(file: string): Promise<ZelConfig> {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, buf) => {
            if (err && err.code === 'ENOENT') {
                return reject(`File does not exist: ${file}`);
            }
            try {
                const data = (bufferToJSON(buf, file): ZelConfig);
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
 * @param {string} file - The full file"s path.
 * @param {string} data - The data to write.
 * @param {Object} opts - See `fs.writeFile`.
 */
export const write = Promise.method((file: string, data: string, opts: any) => {
    file = path.normalize(file);
    const dirs = path.dirname(file);
    return mkdirp(dirs).then(() => writeFile(file, data, opts));
});

/**
 * Downloads the contents from the given repo file path components.
 *
 * @param {string} repo
 * @param {string} branch
 * @param {string} file
 */
export function sync(repo: string, branch: string, file: string) {
    const uri = `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;
    get(uri)
        .then(data => {
            write(file, data);
        })
        .catch(err => {
            throw `Trouble while fetching ${repo}/${branch}/${file}.`;
        });
}
