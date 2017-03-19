#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const { downloadRepo } = require('./lib/repository');
const { getLocalDependencies } = require('./lib/local');
const { ERROR, OK, TITLE, SPACER } = require('./lib/constants');

function init(repo, logger) {
    downloadRepo(repo)
        .then((arr) => arr.map((file) => `${SPACER} - ${file}`))
        .then((arr) => arr.concat('').join('\n'))
        .then((str) => {
            logger.info(OK, TITLE(repo));
            logger.info(str);
        })
        .catch((err) => logger.error(ERROR, err));
}

function initLocal(logger) {
    getLocalDependencies().then((deps) => {
        deps.forEach((repo) => init(repo, logger));
    }).catch((err) => logger.error(ERROR, err));
}

prog
    .version(pkg.version)
    .argument('[query]', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        logger.info('\r'); // padding

        if (args.query) {
            return init(args.query, logger);
        }

        return initLocal(logger);
    });

prog.parse(process.argv);
