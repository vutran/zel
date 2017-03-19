#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const { downloadRepo, getLocalDependencies } = require('./lib');
const { FROM, ERROR, OK } = require('./lib/constants');

function download(repo, logger) {
    downloadRepo(repo).then((files) => {
        files.forEach(file => logger.info(OK, `${file} ${FROM} ${repo}`));
    }).catch(err => logger.error(ERROR, err.message));
}

prog
    .version(pkg.version)
    .argument('[query]', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        if (args.query) {
            return download(args.query, logger);
        }

        getLocalDependencies().then((deps) => {
            deps.forEach(repo => download(repo, logger));
        }).catch(err => logger.error(ERROR, err));
    });

prog.parse(process.argv);
