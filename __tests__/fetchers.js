const BaseFetcher = require('../lib/fetchers/base');
const FileFetcher = require('../lib/fetchers/file');
const GitHubFetcher = require('../lib/fetchers/github');

describe('fetchers', () => {
    describe('BaseFetcher', () => {
        it('should create an instance with default options', () => {
            const inst = new BaseFetcher();
            expect(inst)
                .toBeInstanceOf(BaseFetcher);
            expect(inst.options)
                .toEqual({});
        });

        it('should reject', async () => {
            const inst = new BaseFetcher();
            try {
                await inst.fetchConfig();
            } catch (err) {
                expect(err).toBe('Not yet implemented.');
            }
        });
    });

    describe('FileFetcher', () => {
        it('should extend BaseFetcher', () => {
            const inst = new FileFetcher();
            expect(inst)
                .toBeInstanceOf(BaseFetcher);
        });
    });

    describe('GitHubFetcher', () => {
        it('should extend BaseFetcher', () => {
            const inst = new GitHubFetcher();
            expect(inst)
                .toBeInstanceOf(BaseFetcher);
        });

        it('should create an instance with a token', () => {
            const inst = new GitHubFetcher({ token: 'foobar' });
            expect(inst.options)
                .toEqual({ token: 'foobar' });
        });

        it('should fetch a config from the cache', () => {
            // TODO
        });

        it('should fetch a config from a remote server', () => {
            // TODO
        });

        it('should fetch a config', () => {
            // TODO
        });
    });
});
