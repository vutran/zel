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
	return console.log('show help');
}

const log = msg => console.log(chalk.magenta('> ') + msg);

gittar
	.fetch(repo, {
		useCache: flags.cache,
		force: flags.force,
	})
	.then(file => {
		const src = file.replace(home, '~');
		const tar = dest === home ? home : dest.replace(home, '~');
		log(`sourcing ${src}`);
		log(`targeting ${tar}`);

		gittar.extract(file, dest).then(foo => log('done'));
	});
