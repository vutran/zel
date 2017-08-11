const fs = require('fs');
const join = require('path').join;
const exec = require('child_process').exec;
const rimraf = require('rimraf').sync;
const glob = require('glob').sync;
const mkdir = require('mkdirp');
const test = require('tape');

const repo = 'vutran/gitignore';
const files = ['.gitignore', '.zel'];

const zel = join(__dirname, '../lib');
const fix = join(__dirname, 'fixtures');

const cleanup = str => () => rimraf(str);
const isDir = str => fs.statSync(str).isDirectory();
const tmpDir = _ => join(fix, `tmp-${Math.random()}`);

function expand(dir) {
	return glob(`${dir}/**`, { dot: true, nodir: true }).map(str => {
		return str.replace(dir, '').substr(1); // leading '/'
	});
}

function isHelp(str) {
	return (
		str.includes('Usage') && str.includes('Options') && str.includes('Examples')
	);
}

function validate(t, dir, toClean) {
	return new Promise(res => {
		const arr = expand(dir);
		t.true(isDir(dir), 'creates the target dir');
		t.equal(arr.length, files.length, 'creates all files');
		t.deepEqual(arr, files, 'creates expected files');
		toClean && cleanup(dir);
		res();
	});
}

function run(args, opts) {
	return new Promise((res, rej) => {
		opts = opts || {};
		const cb = (err, out) => (err ? rej(err) : res(out));
		exec(`node ${zel} ${args}`, opts, cb);
	});
}

test('$ zel', t => {
	t.plan(1);
	run('').then(out => {
		t.true(isHelp(out), 'displays help text');
	});
});

test('$ zel -h', t => {
	t.plan(1);
	run('-h').then(out => {
		t.true(isHelp(out), 'displays help text');
	});
});

test('$ zel --help', t => {
	t.plan(1);
	run('--help').then(out => {
		t.true(isHelp(out), 'displays help text');
	});
});

test(`$ zel ${repo}`, t => {
	t.plan(3);
	const tmp = tmpDir();
	mkdir.sync(tmp); // prepare `cwd` context
	run(repo, { cwd: tmp }).then(_ => validate(t, tmp, true));
});

test(`$ zel ${repo} target`, t => {
	t.plan(3);
	const tmp = tmpDir();
	run(`${repo} ${tmp}`).then(_ => validate(t, tmp, true));
});
