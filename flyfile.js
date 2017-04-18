const { format } = require('path');
const { runCLI } = require('jest-cli');

const src = 'src/**/*.js';
const dist = 'lib';

export async function clean(fly) {
    await fly.clear(dist);
}

export async function build(fly, opts) {
    await fly.source(opts.src || src).unflow().target(dist);
}

export async function lint(fly) {
    await fly.source(src).prettier({
        tabWidth: 4,
        parser: 'flow',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 90
    }).target('src');
}

export async function test(fly) {
    const rootDir = fly.root;
    const config = { collectCoverage:true, rootDir };
    await fly.source('__tests__/*.js').run({every: false}, function * () {
        runCLI({ config }, rootDir);
    });
}

export async function watch(fly) {
    await fly.watch(src, ['build', 'test']);
}
