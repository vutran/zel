#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const { downloadRepo } = require('./lib/repository');
const { getLocalDependencies } = require('./lib/local');
const { FROM, ERROR, OK } = require('./lib/constants');

function init(repo, logger) {
    downloadRepo(repo).then((files) => {
        files.forEach(file => logger.info(OK, `${file} ${FROM} ${repo}`));
    }).catch(err => logger.error(ERROR, err.message));
}

function initLocal(logger) {
    getLocalDependencies().then((deps) => {
        deps.forEach(repo => init(repo, logger));
    }).catch(err => logger.error(ERROR, err));
}

prog
    .version(pkg.version)
    .argument('[query]', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        if (args.query) {
            return init(args.query, logger);
        }

        return initLocal(logger);
    });

prog.parse(process.argv);
