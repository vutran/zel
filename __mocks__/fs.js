const fs = jest.genMockFromModule('fs');

// mocks
let __fileMap = {};
let __error = null;

fs.readFile = jest.fn(
    (file, callback) => {
        if (typeof callback === 'function') {
            const error = file in __fileMap ? null : __error;
            callback.call(null, error, __fileMap[file]);
        }
    }
)

fs.writeFile = jest.fn(
    (file, data, options, callback) => {
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

fs.__setFileData = (file, data) => {
    __fileMap[file] = data;
};

fs.__setError = (error) => {
    __error = error;
};

// getters
fs.__getFiles = () => __fileMap;

module.exports = fs;
