import { bufferToJSON, get } from '../src/utils';

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
    });

    describe('getConfig', () => {
        it('should get a config file from the filesystem', () => {
            // TODO
        });
    });

    describe('sync', () => {
        it('should sync/download the specified file', () => {
            // TODO
        });
    });


    describe('write', () => {
        it('should write content to a file', () => {
            // TODO
        });
    });
});
