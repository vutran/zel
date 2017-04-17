// mocks
let __response = null;
let __shouldReject = false;

const fetch = jest.fn(
    (uri, options) =>
        __shouldReject
            ? Promise.reject(__response)
            : Promise.resolve(__response)
);

// setters
fetch.__reset = () => {
    __response = null;
    __shouldReject = false;
};

fetch.__setResponse = (response) => {
    __response = response;
};


fetch.__setShouldReject = (flag) => {
    __shouldReject = true;
};

module.exports = fetch;
