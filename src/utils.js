// @flow
import type { ResolvedZelConfig, ZelConfig } from './types';
const path = require('path');
const { readFile, writeFile } = require('fs');
const fetch = require('node-fetch');
const mkdir = require('mkdirp');
const pify = require('pify');
const CacheConf = require('cache-conf');
const pkg = require('../package');
const { ZEL, LOG } = require('./constants');
const BaseResolver = require('./resolvers/base');

const mkdirp = pify(mkdir);
const writer = pify(writeFile);
const reader = pify(readFile);

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
    const headers = {};
    headers['User-Agent'] = pkg.name;
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
 * @param {string} target - Target write directory
 * @return {Promise<T>}
 */
async function sync<T>(
    repo: string,
    branch: string,
    file: string,
    target: string
): Promise<T> {
    const info = `${repo}/${branch}/${file}`;
    const uri = `https://raw.githubusercontent.com/${info}`;
    const res = await get(uri);
    if (!res.ok) {
        throw new Error(`Trouble while fetching ${info}.`);
    }
    return write(file, await res.text(), target);
}

/**
 * Write to a file with given data.
 * Creates ancestor directories if needed.
 *
 * @param {string} file - The full file's path.
 * @param {string} data - The data to write.
 * @param {string} target - Target write directory
 * @param {Object} opts - See `fs.writeFile`.
 * @return {Promise<T>}
 */
async function write<T>(
    file: string,
    data: string,
    target: string,
    opts: any
): Promise<T> {
    const targetFile = path.resolve(target, path.normalize(file));
    await mkdirp(path.dirname(targetFile));
    return writer(targetFile, data, opts);
}

function clone(deps: Array<string>, target: string, logger: any, resolver: BaseResolver) {
    resolver
        .on('invalid', (resolvedConfig: ResolvedZelConfig) =>
            logger.error(LOG.INVALID, resolvedConfig.repoName)
        )
        .validate(deps)
        .then(valid => valid.map(v => fetchFiles(v.repoName, target, v.config)))
        .then(entry => writeLog(entry, logger))
        .catch(err => logger.error(LOG.ERROR, err));
}

function writeLog(entries: Array<ResolvedZelConfig>, logger: any) {
    entries.forEach(entry => {
        if (entry.config.files) {
            const str = entry.config.files
                .map(file => `${LOG.SPACER} - ${file}`)
                .join('');

            logger.info(LOG.DOWNLOADED, LOG.TITLE(entry.repoName));
            logger.info(str);
        }
    });
}

/**
 * Fetch the list of files in the given repository,
 * and creates them in the current directory.
 *
 * @param {string} - The repository name
 * @param {string} - Write target directory
 * @param {ZelConfig} - The zel config object
 * @return {ZelConfig} - An object with the repository name and config
 */
function fetchFiles(
    repoName: string,
    target: string,
    config: ZelConfig
): ResolvedZelConfig {
    if (config.files && config.files.length) {
        config.files.forEach(file => sync(repoName, 'master', file, target));
    }

    return ({ repoName, config }: ResolvedZelConfig);
}

/**
 * Gets `dependencies` from a local `.zel`, if any
 *
 * @return {Promise<Array<string>>} - The list of local dependencies
 */
function getLocalDependencies(): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
        const dotfile = path.resolve(ZEL.FILE);
        getConfig(dotfile)
            .then(data => resolve(data.dependencies || []))
            .catch(err => reject(err));
    });
}

/**
 * Optionally retrieves the token from the cache.
 * If a token is passed, cache it and return itself.
 *
 * @param {string} token
 * @return {string}
 */
function getCachedToken(token?: string): string {
    const cache = new CacheConf({
        configName: ZEL.RCFILE,
        cwd: ZEL.CACHEDIR,
    });

    if (!token && cache.has('token') && !cache.isExpired('token')) {
        return cache.get('token');
    }

    if (token) {
        cache.set('token', token, { maxAge: ZEL.CACHETIMEOUT });
    }

    return token;
}

module.exports = {
    bufferToJSON,
    fetchFiles,
    get,
    getConfig,
    getLocalDependencies,
    sync,
    write,
    clone,
    writeLog,
    getCachedToken,
};
