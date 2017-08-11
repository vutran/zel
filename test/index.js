const fs = require('fs');
const join = require('path').join;
const exec = require('child_process').exec;
const rimraf = require('rimraf').sync;
const glob = require('glob').sync;
const mkdir = require('mkdirp');
const test = require('tape');

const repo = 'vutran/gitignore';
const files = ['.zel', '.gitignore'];

const zel = join(__dirname, '../lib');
const fix = join(__dirname, 'fixtures');

const cleanup = str => () => rimraf(str);
const expand = (str, opts) => glob(str, opts);
const isHelp = str =>
	str.includes('Usage') && str.includes('Options') && str.includes('Examples');
const isDir = str => fs.statSync(str).isDirectory();
const tmpDir = _ => join(fix, `tmp-${Math.random()}`);

function validate(t, dir) {
	return new Promise(res => {
		const arr = expand(`${dir}/**`, { dot: true, nodir: true });
		console.log(arr);
		t.true(isDir(dir), 'creates the target dir');
		t.equal(arr.length, files.length, 'creates all files');
		t.deepEqual(arr, files, 'creates expected files');
		res();
	});
}

function run(args, opts) {
	return new Promise((res, rej) => {
		opts = opts || {};
		exec(
			`node ${zel} ${args}`,
			opts,
			(err, out) => (err ? rej(err) : res(out))
		);
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
	run(repo, { cwd: tmp }).then(validate(t, tmp)).then();
});

test(`$ zel ${repo} target`, t => {
	t.plan(3);
	const tmp = tmpDir();
	console.log(tmp);
	run(`${repo} ${tmp}`).then(validate(t, tmp)).then();
});
