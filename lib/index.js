#!/usr/bin/env node
const mri = require('mri');
const path = require('path');
const chalk = require('chalk');
const gittar = require('gittar');
const homedir = require('os').homedir;
const ver = require('../package').version;

const home = homedir();
const alias = { c: 'cache', f: 'force', h: 'help' };
const flags = mri(process.argv.slice(2), { alias });

const repo = flags._[0];
const dest = path.resolve((flags.home && home) || flags._[1] || '.');

if (flags.help || !repo) {
	const _ = chalk.underline;
	return console.log(`
  ${_('Usage')}
    $ zel <repo> [target]

  ${_('Options')}
    --cache -c    Disable HTTP requests; offline mode.
    --force -f    Prefer to download a new archive.
     --help -h    Display this help message.

  ${_('Examples')}
    $ zel vutran/boiler
    $ zel vutran/boiler my-app
    $ zel vutran/boiler#v1.2.0
    $ zel gitlab:vutran/boiler
    $ zel vutran/boiler --cache
	`);
}

const log = msg => console.log(chalk.magenta('> ') + msg);

gittar
	.fetch(repo, {
		useCache: flags.cache,
		force: flags.force,
	})
	.then(file => {
		log(`sourcing ${file.replace(home, '~')}`);
		log(`targeting ${dest === home ? home : dest.replace(home, '~')}`);

		gittar.extract(file, dest).then(foo => log('done'));
	});
