#!/usr/bin/env node

const prog = require('caporal');
const { version } = require('./package');
const { downloadRepo } = require('./lib/repository');
const { getLocalDependencies } = require('./lib/local');
const { ERROR, DOWNLOADED, TITLE, SPACER, VALID, INVALID } = require('./lib/constants');
const Resolver = require('./lib/resolver');

function init(repo, logger) {
    downloadRepo(repo)
        .then((arr) => arr.map((file) => `${SPACER} - ${file}`))
        .then((arr) => arr.concat('').join('\n'))
        .then((str) => {
            logger.info(DOWNLOADED, TITLE(repo));
            logger.info(str);
        })
        .catch((err) => logger.error(ERROR, err));
}

function initLocal(logger) {
    getLocalDependencies()
        .then((deps) => {
            if (!deps.length) {
                logger.error(ERROR, 'No local dependencies defined. Please define a repository.');
                return;
            }
            deps.forEach(repo => init(repo, logger));
        })
        .catch((err) => logger.error(ERROR, err));
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

    .command('validate', 'Validates the .zel file.')
    .option('--failFast', 'Terminates on error/invalid repository.')
    .action((args, options, logger) => {
        getLocalDependencies()
            .then((deps) => {
                const resolver = new Resolver(deps);
                resolver.on('valid', (repoName) => {
                    logger.info(VALID, repoName);
                });
                resolver.on('invalid', (repoName) => {
                    logger.error(INVALID, repoName);
                });
                resolver.on('error', (err) => {
                    logger.error(ERROR, err);
                });
                resolver.validate(options.failFast);
            });
    });

prog.parse(process.argv);
