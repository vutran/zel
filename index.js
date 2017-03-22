#!/usr/bin/env node
global.Promise = require('bluebird');

const prog = require('caporal');
const { version } = require('./package');
const { downloadRepo } = require('./lib/repository');
const { getLocalDependencies } = require('./lib/local');
const { LOG } = require('./lib/constants');
const Resolver = require('./lib/resolver');

function init(repo, logger) {
    downloadRepo(repo)
        .then((arr) => arr.map((file) => `${LOG.SPACER} - ${file}`))
        .then((arr) => arr.concat('').join('\n'))
        .then((str) => {
            logger.info(LOG.DOWNLOADED, LOG.TITLE(repo));
            logger.info(str);
        })
        .catch((err) => logger.error(LOG.ERROR, err));
}

function initLocal(logger) {
    getLocalDependencies()
        .then((deps) => {
            if (!deps.length) {
                logger.error(LOG.ERROR, 'No local dependencies defined. Please define a repository.');
                return;
            }
            deps.forEach((repo) => init(repo, logger));
        })
        .catch((err) => logger.error(LOG.ERROR, err));
}

prog
    .version(version)

    .argument('[query]', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        logger.info('\r'); // padding

        if (args.query) {
            return init(args.query, logger);
        }

        return initLocal(logger);
    })

    .command('validate', 'Validates local .zel file.')
    .option('--failFast', 'Terminates on error/invalid repository.')
    .action((args, options, logger) => {
        getLocalDependencies()
            .then((deps) => {
                new Resolver(options)
                    .on('valid', (repoName) => logger.info(LOG.VALID, repoName))
                    .on('invalid', (repoName) => logger.error(LOG.INVALID, repoName))
                    .on('error', (err) => logger.error(LOG.ERROR, err))
                    .validate(deps);
            })
            .catch((err) => logger.error(LOG.ERROR, err));
    });

prog.parse(process.argv);
