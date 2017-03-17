# zel

> `zel` is a small, and simple command-line tool that helps kickstart new projects.

### Benefits

- Simple JSON file to specify files via a `.zel` file
- No complex generator/plugin API
- No need to publish your boilerplate on npm (there's too many!)

## Install

```
$ npm i -g zel
```

## Usage

Create a `.zel` file in your boilerplate repository on GitHub and specify the files to expose to `zel`.

```
{
    "files": [".editorconfig"]
}
```

To quickly clone these files, simply run `zel <username>/<repository>`.

```
$ zel vutran/editorconfig
```

The above command will download `.editorconfig` from the [`vutran/editorconfig`](https://github.com/vutran/editorconfig) repository into the current working directory.

That's it!

## License

MIT © [Vu Tran](https://github.com/vutran/)
