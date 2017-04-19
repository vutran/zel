#!/usr/bin/env node
// @flow
import type { ResolvedZelConfig, ZelConfig } from './types';
const prog = require('caporal');
const { version } = require('../package');
const { fetchFiles } = require('./repository');
const { getLocalDependencies } = require('./local');
const { LOG } = require('./constants');
const BaseResolver = require('./resolvers/base');
const GitHubResolver = require('./resolvers/github');

function writeLog(entries, logger) {
    entries.forEach(entry => {
        if (entry.config.files) {
            const str = entry.config.files
                .map(file => `${LOG.SPACER} - ${file}`)
                .join('');

            logger.info(LOG.DOWNLOADED, LOG.TITLE(entry.repoName));
            logger.info(str);
        }
    });
}

function clone(deps: Array<string>, target: string, logger, resolver: BaseResolver) {
    resolver
        .on('invalid', (resolvedConfig: ResolvedZelConfig) =>
            logger.error(LOG.INVALID, resolvedConfig.repoName)
        )
        .validate(deps)
        .then(valid => valid.map(v => fetchFiles(v.repoName, target, v.config)))
        .then(entry => writeLog(entry, logger))
        .catch(err => logger.error(LOG.ERROR, err));
}

prog
    .version(version)
    .argument('[query]', 'Specify the repository to fetch.')
    .option(
        '--token <token>',
        'Specify a GitHub token for fetch private repository.',
        prog.STRING
    )
    .option(
        '--target <target>',
        'Specify a target path to download to. Defaults to current directory.'
    )
    .action((args, options, logger) => {
        const target = options.target || process.cwd();
        const resolver = new GitHubResolver({ token: options.token });

        logger.info(); // padding

        if (args.query) {
            return clone([args.query], target, logger, resolver);
        }

        return getLocalDependencies()
            .then(deps => clone(deps, target, logger, resolver))
            .catch(err => logger.error(LOG.ERROR, err));
    })
    .command('validate', 'Validates local .zel file.')
    .option(
        '--token <token>',
        'Specify a GitHub token for fetch private repository.',
        prog.STRING
    )
    .action((args, options, logger) => {
        const resolver = new GitHubResolver({ token: options.token });
        getLocalDependencies()
            .then(deps => {
                resolver
                    .on('valid', repo => logger.info(LOG.VALID, repo.repoName))
                    .on('invalid', repo => logger.error(LOG.INVALID, repo.repoName))
                    .validate(deps)
                    .catch(err => logger.error(LOG.ERROR, err));
            })
            .catch(err => logger.error(LOG.ERROR, err));
    });

prog.parse(process.argv);
