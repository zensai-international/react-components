export enum UriScheme {
    HTTP,
    HTTPS,
    Unknown,
}

export interface Uri {
    host?: string;
    path?: string;
    port?: number;
    scheme?: UriScheme;
    query?: string;
    queryParameters?: { [name: string]: string };
}