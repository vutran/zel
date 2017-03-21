const { homedir } = require('os');
const { join } = require('path');
const chalk = require('chalk');

const HOME = join(homedir(), '.zel');

module.exports = {
    ZEL: {
        FILE: '.zel',
        // zel home directory
        HOMEDIR: HOME,
        // cache directory
        CACHEDIR: join(HOME, 'cache'),
        // Time for cache to live (seconds)
        CACHETIMEOUT: 60 * 60 * 60,
    },
    LOG: {
        // logger/text constants
        ERROR: chalk.red('Error:'),
        DOWNLOADED: chalk.green('Downloaded:'),
        SPACER: Array(14).join(' '),
        TITLE: chalk.cyan.underline,
        VALID: chalk.green('Valid:'),
        INVALID: chalk.red('Invalid:'),
    }
};

