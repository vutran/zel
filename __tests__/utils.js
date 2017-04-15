import { bufferToJSON } from '../lib/utils';

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
});
