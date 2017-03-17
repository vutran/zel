#!/usr/bin/env node

const prog = require('caporal');
const chalk = require('chalk');
const pkg = require('./package');
const utils = require('./utils');

const cli = prog
    .version(pkg.version)
    .argument('<query>', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        utils.download(args.query)
            .then((files) => {
                files.forEach((file) => {
                    logger.info(chalk.green('Downloaded:'), file);
                });
            })
            .catch((err) => logger.error(chalk.red('Error'), err.message));
    });

prog.parse(process.argv);
