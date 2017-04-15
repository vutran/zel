import { bufferToJSON } from '../src/utils';

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

        it('should fetch data from a remote server', () => {
            // TODO
        });

        it('should get a config file from the filesystem', () => {
            // TODO
        });

        it('should sync/download the specified file', () => {
            // TODO
        });

        it('should write content to a file', () => {
            // TODO
        });
    });
});
