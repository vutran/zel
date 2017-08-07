// @flow
const { homedir } = require('os');
const GitHubResolver = require('../resolvers/github');
const { getCachedToken, clone, getLocalDependencies } = require('../utils');
const { LOG } = require('../constants');

module.exports = function(args: Object, options: Object, logger: any) {
  let target = options.target || process.cwd();

  if (options.home) {
    target = homedir();
  }

  const token = getCachedToken(options.token);
  const resolver = new GitHubResolver({ token });

  logger.info(); // padding

  if (args.query) {
    return clone([args.query], target, logger, resolver);
  }

  return getLocalDependencies()
    .then(deps => clone(deps, target, logger, resolver))
    .catch(err => logger.error(LOG.ERROR, err));
};
