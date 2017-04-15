// mocks
let __response: any;

const fetch = jest.fn(
    (uri: string, options: any) => Promise.resolve(__response)
);

// setters
fetch.__setResponse = (response: any) => {
    __response = response;
};

module.exports = fetch;
