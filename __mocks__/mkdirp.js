// mocks
let __dirList = [];
let __error = null;

const mkdirp = jest.fn(
    (directory, callback) => {
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

mkdirp.__setError = (error) => {
    _error = error;
};

// getters
mkdirp.__getDirs = () => __dirList;

module.exports = mkdirp;
