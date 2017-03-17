#!/usr/bin/env node

const prog = require('caporal');
const pkg = require('./package');
const utils = require('./utils');

const cli = prog
    .version(pkg.version)
    .argument('<query>', 'Specify the repository to fetch.')
    .action((args, options, logger) => {
        utils.download(args.query)
            .then((files) => {
                files.forEach((file) => {
                    logger.info(`Downloaded: ${file}`);
                });
            })
            .catch((err) => logger.error(err));
    });

prog.parse(process.argv);
