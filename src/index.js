#!/usr/bin/env node

import prog from 'caporal';
import Promise from 'bluebird';
import { version } from '../package';
import { fetchFiles } from './repository';
import { getLocalDependencies } from './local';
import { LOG } from './constants';
import GitHubResolver from './resolvers/github';

const resolver = new GitHubResolver();

function writeLog(entries, logger) {
    entries.forEach(entry => {
        if (entry.config.files) {
            const str = entry.config.files
                .map(file => `${LOG.SPACER} - ${file}`)
                .concat('')
                .join('\n');

            logger.info(LOG.DOWNLOADED, LOG.TITLE(entry.repoName));
            logger.info(str);
        }
    });
}

function clone(deps, logger) {
    resolver
        .on('invalid', repo => logger.error(LOG.INVALID, repo.repoName))
        .validate(deps)
        .then(valid => valid.map(v => fetchFiles(v.repoName, v.config)))
        .then(entry => writeLog(entry, logger))
        .catch(err => logger.error(LOG.ERROR, err));
}

prog
    .version(version)
    .argument('[query]', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        logger.info('\r'); // padding

        if (args.query) {
            return clone([args.query], logger);
        }

        return getLocalDependencies()
            .then(deps => clone(deps, logger))
            .catch(err => logger.error(LOG.ERROR, err));
    })
    .command('validate', 'Validates local .zel file.')
    .action((args, options, logger) => {
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
