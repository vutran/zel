const chalk = require('chalk');

module.exports = {
    DOTFILE: '.zel',
    ERROR: chalk.red('Error:'),
    OK: chalk.green('Downloaded:'),
    REPO: chalk.cyan.underline,
    SPACER: Array(14).join(' ')
};

