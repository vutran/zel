const tests = '__tests__/*.js';
const types = 'src/types/**';
const src = 'src/**/*.js';
const dist = 'lib';

export async function clean(task) {
    await task.clear(dist);
}

export async function build(task, opts) {
    await task.source(opts.src || src, { ignore:types }).unflow().target(dist);
}

export async function lint(task) {
    await task.source(src).prettier({
        tabWidth: 4,
        parser: 'flow',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 90
    }).target('src');
}

export async function test(task) {
    await task.source(tests).jest({ collectCoverage:true });
}

export async function watch(task) {
    await task.watch([tests, '__mocks__/*.js'], 'test');
    await task.watch(src, ['build', 'test']);
}
