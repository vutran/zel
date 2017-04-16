// mocks
let __dirList: Array<string> = [];
let __error: Error = null;

const mkdirp = jest.fn(
    (directory: string, callback: Function) => {
        __dirList.push(directory);
        if (typeof callback === 'function') {
            callback.call(null, __error);
        }
    }
);

// setters
mkdirp.__reset = () => {
    __dirList = [];
    __error = null;
};

mkdirp.__setError = (error: Error) => {
    _error = error;
};

// getters
mkdirp.__getDirs = () => __dirList;

module.exports = mkdirp;
