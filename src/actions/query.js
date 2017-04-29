// @flow
const GitHubResolver = require('../resolvers/github');
const { clone, getLocalDependencies } = require('../utils');
const { LOG } = require('../constants');

module.exports = function(args: Object, options: Object, logger: any) {
    const target = options.target || process.cwd();
    const resolver = new GitHubResolver({ token: options.token });

    logger.info(); // padding

    if (args.query) {
        return clone([args.query], target, logger, resolver);
    }

    return getLocalDependencies()
        .then(deps => clone(deps, target, logger, resolver))
        .catch(err => logger.error(LOG.ERROR, err));
};
