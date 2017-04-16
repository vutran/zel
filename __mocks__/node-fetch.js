// mocks
let __response: any = null;
let __shouldReject: boolean = false;

const fetch = jest.fn(
    (uri: string, options: any) =>
        __shouldReject
            ? Promise.reject(__response)
            : Promise.resolve(__response)
);

// setters
fetch.__reset = () => {
    __response = null;
    __shouldReject = false;
};

fetch.__setResponse = (response: any) => {
    __response = response;
};


fetch.__setShouldReject = (flag: boolean) => {
    __shouldReject = true;
};

module.exports = fetch;
