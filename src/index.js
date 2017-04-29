#!/usr/bin/env node
// @flow
const prog = require('caporal');
const { version } = require('../package');
const actions = require('./actions');

prog
    .version(version)
    // ACTION: query
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
    .action(actions.query)
    // ACTION: validate
    .command('validate', 'Validates local .zel file.')
    .option(
        '--token <token>',
        'Specify a GitHub token for fetch private repository.',
        prog.STRING
    )
    .action(actions.validate);

prog.parse(process.argv);
