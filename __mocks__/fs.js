const fs = jest.genMockFromModule('fs');

// mocks
let __fileMap: { [file: string]: any } = {};
let __error: Error = null;

fs.readFile = jest.fn(
    (file: string, callback: Function) => {
        if (typeof callback === 'function') {
            const error = file in __fileMap ? null : __error;
            callback.call(null, error, __fileMap[file]);
        }
    }
)

fs.writeFile = jest.fn(
    (file: string, data: any, options: Object, callback: Function) => {
        fs.__setFileData(file, data); // writes to the file map
        if (typeof callback === 'function') {
            callback.call(null, __error);
        }
    }
)

// setters
fs.__reset = () => {
    __fileMap = {};
    __error = null;
};

fs.__setFileData = (file: string, data: any) => {
    __fileMap[file] = data;
};

fs.__setError = (error: Error) => {
    __error = error;
};

// getters
fs.__getFiles = () => __fileMap;

module.exports = fs;
