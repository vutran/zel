const url = require('url');
const https = require('https');
const fs = require('fs');
const pkg = require('../package');

const DOTFILE = '.zel';

/**
 * Adds a new command
 *
 * @param {Object} cli - The Caporal CLI instance
 * @param {Function} action - The command function
 */
const add = (cli, action) => {
    action.call(null, cli);
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
 * Parse (as JSON) a base64 string
 *
 * @param {String} content
 * @return {Object}
 */
const parseBase64ToJson = (content) => {
    return JSON.parse(
        Buffer.from(content, 'base64').toString('utf8')
    );
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
const download = (repoName) => new Promise((resolve, reject) => {
    const parts = repoName.split('/');
    if (parts.length !== 2) {
        throw new Error('Invalid repository name. Format should be "<username>/<repository>"');
    }

    // fetches the dotfile to find the files to download
    get(`https://api.github.com/repos/${repoName}/contents/${DOTFILE}`)
        .then((resp) => parseBase64ToJson(resp.content))
        .then((dotfile) => fetchFiles(repoName, dotfile.files))
        .then((files) => {
            resolve(files);
        })
        .catch((err) => reject(err));
});

module.exports = {
    add,
    download,
};
