#!/usr/bin/env node

const prog = require('caporal');
const chalk = require('chalk');
const pkg = require('./package');
const utils = require('./utils');

const ERROR = chalk.red('Error:');
const OK = chalk.green('Downloaded:');

function download(repo, logger) {
    utils.downloadRepo(repo).then(files => {
        files.forEach(file => logger.info(OK, file));
    }).catch(err => logger.error(ERROR, err.message));
}

const cli = prog
    .version(pkg.version)
    .argument('[query]', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        if (args.query) {
            return download(args.query, logger);
        }

        utils.getLocalDependencies().then(deps => {
            deps.forEach(repo => download(repo, logger));
        }).catch(err => logger.error(ERROR, err));
    });

prog.parse(process.argv);
