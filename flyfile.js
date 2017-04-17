const src = 'src/**/*.js';
const dist = 'lib';

export async function clean(fly) {
    await fly.clear(dist);
}

export async function build(fly) {
    await fly.source(src).unflow().target(dist);
}
