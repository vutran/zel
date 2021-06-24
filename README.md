🚧 Discontinued. Please use [Github templates](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-on-github/creating-a-template-repository).

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

#### Repository: `vutran/editorconfig`
```json
{
    "files": [".editorconfig"]
}
```

### Running `zel`

To quickly clone these files, simply run `zel <username>/<repository>`.

```
$ zel vutran/editorconfig
```

The above command will download `.editorconfig` from the [`vutran/editorconfig`](https://github.com/vutran/editorconfig) repository into the current working directory.

That's it!

### Dependencies

Sometimes, your boilerplate may depend on other boilerplates. You can depend on other repositories by adding it to the `dependencies` list in your `.zel` file.

#### Repository: `vutran/new`

```json
{
    "dependencies": [
        "vutran/editorconfig",
        "vutran/gitignore"
    ]
}
```

And to bootstrap your new project:

```
$ zel vutran/new
```

## Commands

Scaffold a project

```
$ zel vutran/new
```

Scaffolding a private GitHub repository

```
$ zel vutran/new --token abc123
```

Specifying a target directory for your new project

```
$ zel vutran/new --target ~/Project/MyNewProject
```

Want to scaffold your user home directory?

```
$ zel vutran/home --home
```

For more information

```
$ zel -h
```

## Contributing

1. Clone the repository: `git clone git@github.com:vutran/zel.git`
2. Install dependencies: `npm install` or `yarn`
3. Install [flow-typed](https://github.com/flowtype/flow-typed) typings: `npm run flow-typed`
4. Start [Fly](https://github.com/flyjs/fly) dev task: `npm run dev`
5. Make edits, commit
6. Submit a [PR](https://github.com/vutran/zel/compare).

## License

MIT © [Vu Tran](https://github.com/vutran/)
