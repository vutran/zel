const { bufferToJSON, get, getConfig, sync, write } = require('../lib/utils');

jest.mock('fs');

describe('utils', () => {
    describe('bufferToJSON', () => {
        it('should convert a buffer to JSON', () => {
            const buff = Buffer.from('eyJmb28iOiJiYXIifQ==', 'base64');
            expect(bufferToJSON(buff))
                .toEqual({ foo: 'bar' });
        });

        it('should throw an error', () => {
            const buff = 'NOT_VALID_BUFFER';
            const a = () => bufferToJSON(buff);
            expect(a).toThrow();
        });
    });

    describe('get', () => {
        const fetch = require('node-fetch');

        beforeEach(() => {
            jest.clearAllMocks();
            fetch.__reset();
        });

        it('should fetch data from a remote server', async () => {
            fetch.__setResponse('{"foo":"bar"}');

            const results = await get('https://google.com');

            expect(fetch)
                .toBeCalledWith('https://google.com', {
                    headers: {
                        'User-Agent': 'zel',
                    },
                });
            expect(results)
                .toBe('{"foo":"bar"}');
        });

        it('should fetch with a token', async () => {
            fetch.__setResponse('{"foofoo":"barbar"}');

            const results = await get('https://github.com', { token: 'TEST_TOKEN' });

            expect(fetch)
                .toBeCalledWith('https://github.com', {
                    headers: {
                        'User-Agent': 'zel',
                        'Authorization': 'token TEST_TOKEN',
                    },
                });
            expect(results)
                .toBe('{"foofoo":"barbar"}');
        });

        it('should handle rejections', async () => {
            fetch.__setShouldReject(true);
            fetch.__setResponse('THIS IS A REJECTION');

            try {
                await get('https://rejected.com');
            } catch (err) {
                expect(err).toBe('THIS IS A REJECTION');
            }
        });
    });

    describe('getConfig', () => {
        const fs = require('fs');
        beforeEach(() => {
            jest.clearAllMocks();
            fs.__reset();
        });

        it('should get a config file from the filesystem', async () => {
            const fooData = Buffer.from('{"foo":"FOO"}');
            const barData = Buffer.from('{"bar":"BAR"}');

            fs.__setFileData('foo.txt', fooData);
            fs.__setFileData('bar.txt', barData);

            const fooResults = await getConfig('foo.txt');
            const barResults = await getConfig('bar.txt');

            expect(fs.readFile)
                .toBeCalled();
            expect(fooResults)
                .toEqual({ foo: 'FOO' });
            expect(barResults)
                .toEqual({ bar: 'BAR' });
        });

        it('should throw an error if file does not exist', async () => {
            fs.__setError(new Error('Invalid file'));

            try {
                await getConfig('invalid.txt');
            } catch (err) {
                expect(err).toEqual(new Error('Invalid file'));
            }
        });
    });

    describe('sync', () => {
        const fs = require('fs');
        const fetch = require('node-fetch');
        const mkdirp = require('mkdirp');

        beforeEach(() => {
            jest.clearAllMocks();
            fs.__reset();
            fetch.__reset();
            mkdirp.__reset();
        });

        it('should sync/download the specified file', async () => {
            fetch.__setResponse({ ok: true, text: () => 'FOO RESPONSE' });

            await sync('vutran/test', 'master', 'foo.txt', '/target/dir');

            expect(fs.writeFile)
                .toBeCalled();
            expect(fs.__getFiles())
                .toEqual({ '/target/dir/foo.txt': 'FOO RESPONSE' });
            expect(mkdirp)
                .toBeCalled();
        });

        it('should throw when trying to sync an invalid file', async () => {
            fetch.__setResponse({ ok: false });

            try {
                await sync('vutran/test', 'master', 'invalid.txt', '/target/dir');
            } catch (err) {
                expect(err).toEqual(new Error('Trouble while fetching vutran/test/master/invalid.txt.'));
            }

            expect(fs.writeFile)
                .not.toBeCalled();
            expect(mkdirp)
                .not.toBeCalled();
        });
    });


    describe('write', () => {
        const fs = require('fs');
        const mkdirp = require('mkdirp');

        beforeEach(() => {
            jest.clearAllMocks();
            fs.__reset();
            mkdirp.__reset();
        });

        it('should write content to a file', async () => {
            await write('test/foo.txt', 'FOO', '/target/dir');

            expect(mkdirp)
                .toBeCalled();
            expect(mkdirp.__getDirs())
                .toContain('/target/dir/test');
            expect(fs.writeFile)
                .toBeCalled();
            expect(fs.__getFiles())
                .toEqual({ '/target/dir/test/foo.txt': 'FOO' });
        });
    });
});
