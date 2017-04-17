const { format } = require('path');
const { runCLI } = require('jest-cli');

const src = 'src/**/*.js';
const dist = 'lib';

export async function clean(fly) {
    await fly.clear(dist);
}

export async function build(fly) {
    await fly.source(src).unflow().target(dist);
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
    await fly.source('__tests__/*.js').run({every: false}, function * (file) {
        runCLI({ config }, rootDir, result => {
            if (result.numFailedTests || result.numFailedTestSuites) {
                console.log('Tests Failed!');
            }
        })
    });
}
