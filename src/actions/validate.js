// @flow
const GitHubResolver = require('../resolvers/github');
const { getCachedToken, getLocalDependencies } = require('../utils');
const { LOG } = require('../constants');

module.exports = function(args: Object, options: Object, logger: any) {
  const token = getCachedToken(options.token);
  const resolver = new GitHubResolver({ token });

  getLocalDependencies()
    .then(deps => {
      resolver
        .on('valid', repo => logger.info(LOG.VALID, repo.repoName))
        .on('invalid', repo => logger.error(LOG.INVALID, repo.repoName))
        .validate(deps)
        .catch(err => logger.error(LOG.ERROR, err));
    })
    .catch(err => logger.error(LOG.ERROR, err));
};
