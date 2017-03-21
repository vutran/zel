const chalk = require('chalk');

module.exports = {
    DOTFILE: '.zel',
    ERROR: chalk.red('Error:'),
    DOWNLOADED: chalk.green('Downloaded:'),
    SPACER: Array(14).join(' '),
    TITLE: chalk.cyan.underline
};

