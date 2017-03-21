const path = require('path');
const os = require('os');
const chalk = require('chalk');

const ZEL_HOMEDIR = path.resolve(os.homedir(), '.zel');

module.exports = {
    // zel home directory
    ZEL_HOMEDIR: ZEL_HOMEDIR,

    // cache directory
    ZEL_CACHEDIR: path.resolve(ZEL_HOMEDIR, 'cache'),

    // Time for cache to live (seconds)
    ZEL_CACHETIMEOUT: 60 * 60 * 60,

    DOTFILE: '.zel',

    // logger/text constants
    ERROR: chalk.red('Error:'),
    DOWNLOADED: chalk.green('Downloaded:'),
    SPACER: Array(14).join(' '),
    TITLE: chalk.cyan.underline,
    VALID: chalk.green('Valid:'),
    INVALID: chalk.red('Invalid:'),
};

