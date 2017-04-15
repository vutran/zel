// @flow
import type { ZelConfig } from './types';
const { dirname, normalize } = require('path');
const { readFile, writeFile } = require('fs');
const Promise = require('bluebird');
const fetch = require('node-fetch');
const mkdir = require('mkdirp');
const { name } = require('../package');

const mkdirp = Promise.promisify(mkdir);
const writer = Promise.promisify(writeFile);
const reader = Promise.promisify(readFile);

const headers = { 'User-Agent': name };

/**
 * Parse a (`.zel`) file's base64 string as JSON.
 * Customizes handler for `Unexpected Token` error
 *
 * @param Buffer} content - The file's contents
 * @param {string} filepath - The file's path
 * @return {Object}
 */
function bufferToJSON(content: Buffer, filepath: string): Object {
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
function get<T: any>(uri: string, options: any): Promise<T> {
    const opts = Object.assign({ headers }, options);
    return fetch(uri, opts).then(res => res.json());
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
    const uri = `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;
    const data = await get(uri); // throw `Trouble while fetching ${repo}/${branch}/${file}.`;
    return write(file, data);
}

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 *
 * @param {string} file - The full file"s path.
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
