const { ZEL } = require('../constants');
const { bufferToJSON, get } = require('../utils');
const BaseFetcher = require('./base');

module.exports = class GitHubFetcher extends BaseFetcher {
    /**
     * Fetches the zel configuration file from the GitHub repository.
     *
     * @param {String} repoName - The repo name
     * @return {Promise<Object>} - The configuration object
     */
    fetchConfig(repoName) {
        return get(`https://api.github.com/repos/${repoName}/contents/${ZEL.FILE}`)
            .then((resp) => {
                if (resp.message === 'Not Found') {
                    return Promise.reject(`${repoName} not found.`);
                }
                return bufferToJSON(resp.content, `"${ZEL.FILE}" from ${repoName}`);
            })
            .catch(err => Promise.reject(err));
    }
};
