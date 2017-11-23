const DefaultHttpPort: number = 80;
const DefaultHttpsPort: number = 443;

export enum UriScheme {
    HTTP,
    HTTPS
}

export interface Uri {
    // host?: string;
    // path?: string;
    // port?: number;
    // scheme?: UriScheme;
    query?: string;
    queryParameters?: { [name: string]: string };
}

export class UriBuilder {
    private _host: string = 'localhost';
    private _path: string = '';
    private _port: number = DefaultHttpPort;
    private _scheme: UriScheme = UriScheme.HTTP;
    private _queryParameters?: { [name: string]: string } = {};

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

    public addQueryParameter(name: string, value: string): UriBuilder {
        this._queryParameters[name] = encodeURIComponent(value);

        return this;
    }

    public setHost(host: string): UriBuilder {
        this._host = host;

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
            const schemeAndHostAndPort = UriBuilder.isDefaultPort(this._scheme, this._port)
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
    private static getQuery(uri: string): string {
        return uri.slice(uri.indexOf('?'));
    }

    private static getQueryParameters(query: string): { [name: string]: string } {
        const hashes = query.slice(1).split('&');
        let result = {};

        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i].split('=');

            result[hash[0]] = decodeURIComponent(hash[1]);
        }

        return result;
    }

    // private static getScheme(uri: string): UriScheme {
    //     const index = uri.indexOf('://');

    //     return index ? UriScheme[(uri.toUpperCase())] : null;
    // }

    public parse(uri): Uri {
        const query = UriParser.getQuery(uri);

        return {
            query: query,
            queryParameters: UriParser.getQueryParameters(query)
        };
    }
}