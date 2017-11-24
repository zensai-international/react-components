import { parse } from 'url';

const DefaultHttpPort: number = 80;
const DefaultHttpsPort: number = 443;

export enum UriScheme {
    HTTP,
    HTTPS,
    Unknown
}

export interface Uri {
    host?: string;
    path?: string;
    port?: number;
    scheme?: UriScheme;
    query?: string;
    queryParameters?: { [name: string]: string };
}

export class UriBuilder {
    private _host: string = 'localhost';
    private _path: string = '';
    private _port: number = DefaultHttpPort;
    private _scheme: UriScheme = UriScheme.HTTP;
    private _queryParameters?: { [name: string]: string } = {};

    public constructor(uri?: Uri) {
        if (uri) {
            this.setScheme(uri.scheme)
                .setHost(uri.host)
                .setPort(uri.port)
                .setPath(uri.path)
                .addQueryParameters(uri.queryParameters);
        }
    }

    private static getQuery(queryParameters: { [name: string]: string }): string {
        let result = '';

        for (let queryParameterName in queryParameters) {
            result = result ? (result + '&') : '?';
            result += `${queryParameterName}=${queryParameters[queryParameterName]}`;
        }

        return result;
    }

    private static isDefaultPort(scheme: UriScheme, port: number): boolean {
        return ((scheme == UriScheme.HTTP) && (port == DefaultHttpPort))
            || ((scheme == UriScheme.HTTPS) && (port == DefaultHttpsPort));
    }

    public addQueryParameter(name: string, value: any): UriBuilder {
        this._queryParameters[name] = value ? encodeURIComponent(value.toString()) : value;

        return this;
    }

    public addQueryParameters(parameters: { [name: string]: string }): UriBuilder {
        if (parameters) {
            for (let parameterName in parameters) {
                this.addQueryParameter(parameterName, parameters[parameterName]);
            }
        }

        return this;
    }

    public setHost(host: string): UriBuilder {
        this._host = host;

        return this;
    }

    public setPath(path: string): UriBuilder {
        this._path = path;

        return this;
    }

    public setPort(port: number): UriBuilder {
        this._port = port;

        return this;
    }

    public setScheme(scheme: UriScheme): UriBuilder {
        this._scheme = scheme;

        return this;
    }

    public build(isFullUrl: boolean = true): string {
        const query = UriBuilder.getQuery(this._queryParameters);
        const pathAndQuery = this._path + query;

        if (isFullUrl) {
            const schemeAndHostAndPort = !this._port || UriBuilder.isDefaultPort(this._scheme, this._port)
                ? `${UriScheme[this._scheme].toLowerCase()}://${this._host}`
                : `${UriScheme[this._scheme].toLowerCase()}://${this._host}:${this._port}`;

            return pathAndQuery
                ? ((pathAndQuery.indexOf('/') == 0) ? (schemeAndHostAndPort + pathAndQuery) : (schemeAndHostAndPort + '/' + pathAndQuery))
                : schemeAndHostAndPort;
        } else {
            return pathAndQuery;
        }
    }
}

export class UriParser {
    public static readonly currentUri: Uri = new UriParser().parse(window.location.href);

    private static getQueryParameters(query: string): { [name: string]: string } {
        const hashes = query.split('&');
        let result = {};

        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i].split('=');

            result[hash[0]] = decodeURIComponent(hash[1]);
        }

        return result;
    }
    
    public parse(uri: string): Uri {
        const obj = parse(uri);
        const protocol = obj.protocol ? obj.protocol.slice(0, obj.protocol.length - 1).toUpperCase() as string : null;

        return {
            scheme: protocol ? UriScheme[protocol] : UriScheme.Unknown,
            host: obj.host,
            path: obj.pathname,
            query: obj.query,
            queryParameters: obj.query ? UriParser.getQueryParameters(obj.query) : {}
        };
    }
}