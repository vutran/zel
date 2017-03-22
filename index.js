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
            new Resolver()
                .validate(deps)
                    .then(valid => valid.forEach(config => init(config.repoName, logger)))
                    .catch(err => logger.error(LOG.ERROR, err));
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
    .action((args, options, logger) => {
        getLocalDependencies()
            .then((deps) => {
                new Resolver(options)
                    .on('valid', (repo) => logger.info(LOG.VALID, repo.repoName))
                    .on('invalid', (repo) => logger.error(LOG.INVALID, repo.repoName))
                    .validate(deps)
                        .catch(err => logger.error(LOG.ERROR, err));

            })
            .catch((err) => logger.error(LOG.ERROR, err));
    });

prog.parse(process.argv);
