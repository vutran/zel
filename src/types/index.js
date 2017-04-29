// @flow
export interface ZelConfig {
    // A list of files to include in your zel project.
    files?: Array<string>,
    // List of zel projects that this project depends on.
    dependencies?: Array<string>,
}

export interface ResolvedZelConfig {
    repoName: string,
    config: ZelConfig,
}

export interface FetchOptions {
    token: ?string,
}

export interface ValidateOptions {
    token: ?string,
}
