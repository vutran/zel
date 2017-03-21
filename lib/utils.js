const fs = require('fs');
const url = require('url');
const https = require('https');
const { name } = require('../package');

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
const get = (uri, options) => new Promise((resolve, reject) => {
    if (!uri) {
        reject('Invalid URL.');
        return;
    }

    const opts = Object.assign({}, {
        json: true,
    }, options);

    const u = url.parse(uri);
    const reqOptions = {
        protocol: u.protocol,
        hostname: u.hostname,
        path: u.path,
        headers: {
            'User-Agent': name,
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
 * Reads a config file
 *
 * @param {String} file - The path to the file
 * @return {Promise<Object>} - The file contents as JSON Object
 */
const getConfig = (file) => new Promise((resolve, reject) => {
    fs.readFile(file, (err, buf) => {
        if (err && err.code === 'ENOENT') {
			return reject(`File does not exist: ${file}`);
        }
        try {
            const data = bufferToJSON(buf, file);
            resolve(data);
        } catch (err2) {
            reject(err2.message);
        }
    });
});

/**
 * Downloads the contents from the given `url` to the `file` path.
 *
 * @param {String} repo
 * @param {String} branch
 * @param {String} file
 */
const sync = (repo, branch, file) => {
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;
    const fileStream = fs.createWriteStream(file);
    https.get(url, (resp) => resp.pipe(fileStream));
};

module.exports = {
    bufferToJSON,
    get,
	getConfig,
    sync,
};
