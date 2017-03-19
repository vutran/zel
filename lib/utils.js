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
    sync,
};
