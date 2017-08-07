#!/usr/bin/env node
const os = require('os');
const mri = require('mri');
const gittar = require('gittar');
const res = require('path').resolve;
const ver = require('../package').version;

const home = os.homedir();
const alias = { c:'cache', f:'force', h:'help' };
const flags = mri(process.argv.slice(2), { alias });

const repo = flags._[0];
const dest = res(flags.home && home || flags._[1] || '.');

if (flags.help || !repo) {
	return console.log('show help');
}

gittar.fetch(repo, {
	useCache: flags.cache,
	force: flags.force
}).then(file => {
	const src = file.replace(home, '~');
	const tar = dest === home ? home : dest.replace(home, '~');
	console.log(`> using archive ${src}`);
	console.log(`> extracting to ${tar}`);

	gittar.extract(file, dest).then(foo => {
		console.log(`> done`);
	});
});
