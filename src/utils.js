// @flow
import type { ZelConfig } from './types';
const { dirname, normalize } = require('path');
const { readFile, writeFile } = require('fs');
const Promise = require('bluebird');
const fetch = require('node-fetch');
const mkdir = require('mkdirp');
const pkg = require('../package');

const mkdirp = Promise.promisify(mkdir);
const writer = Promise.promisify(writeFile);
const reader = Promise.promisify(readFile);

/**
 * Converts a Buffer (base64 string) to a JSON object.
 *
 * @param {Buffer} content - The Buffer to convert
 * @return {Object}
 */
function bufferToJSON(content: Buffer): Object {
    try {
        return JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
    } catch (err) {
        throw err;
    }
}

/**
 * Fetches data from a URI
 *
 * @param {string} uri
 * @param {Object} options
 * @return {Promise<T>}
 */
function get<T: any>(uri: string, options: any): Promise<T> {
    const headers = { 'User-Agent': pkg.name };
    if (options && options.token) {
        headers.Authorization = `token ${options.token}`;
    }
    return fetch(uri, { headers });
}

/**
 * Reads a config file
 *
 * @param {string} file - The path to the file
 * @return {Promise<ZelConfig>} - The file contents as JSON Object
 */
async function getConfig(file: string): Promise<ZelConfig> {
    const buf = await reader(file); // err && (err.code === 'ENOENT') && reject(`File does not exist: ${file}`);
    return (bufferToJSON(buf, file): ZelConfig); // reject(msg);
}

/**
 * Downloads the contents from the given repo file path components.
 *
 * @param {string} repo
 * @param {string} branch
 * @param {string} file
 * @return {Promise<T>}
 */
async function sync(repo: string, branch: string, file: string): Promise<T> {
    const info = `${repo}/${branch}/${file}`;
    const uri = `https://raw.githubusercontent.com/${info}`;
    const res = await get(uri);
    if (!res.ok) {
        throw new Error(`Trouble while fetching ${info}.`);
    }
    return write(file, res.text());
}

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 *
 * @param {string} file - The full file's path.
 * @param {string} data - The data to write.
 * @param {Object} opts - See `fs.writeFile`.
 * @return {Promise<T>}
 */
async function write(file: string, data: string, opts: any): Promise<T> {
    file = normalize(file);
    await mkdirp(dirname(file));
    return writer(file, data, opts);
}

module.exports = { bufferToJSON, get, getConfig, sync, write };
