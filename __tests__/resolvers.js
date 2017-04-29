const BaseResolver = require('../lib/resolvers/base');
const GitHubResolver = require('../lib/resolvers/github');

describe('resolvers', () => {
    describe('BaseResolver', () => {
        it('should create an instance with default options', () => {
            const inst = new BaseResolver();
            expect(inst)
                .toBeInstanceOf(BaseResolver);
            expect(inst.options)
                .toEqual({});
        });

        it('should reject', async () => {
            const inst = new BaseResolver();
            try {
                await inst.validate();
            } catch (err) {
                expect(err).toBe('Not yet implemented.');
            }
        });
    });

    describe('GitHubResolver', () => {
        it('should extend BaseResolver', () => {
            const inst = new BaseResolver();
            expect(inst)
                .toBeInstanceOf(BaseResolver);
        });

        it('should create an instance with a token', () => {
            const inst = new GitHubResolver({ token: 'foobar' });
            expect(inst.options)
                .toEqual({ token: 'foobar' });
        });

        it('should validate a list of repositories', () => {
            // TODO
        });

        it('should fetch a config for a specific repository', () => {
            // TODO
        });

        it('should fetch a list of dependencies from a config', () => {
            // TODO
        });
    });
});
