import { Uri, UriScheme } from './uri';

const DefaultHttpPort = 80;
const DefaultHttpsPort = 443;

export class UriBuilder {
    private _host: string;
    private _path = '';
    private _port: number;
    private _scheme: UriScheme;
    private _queryParameters?: { [name: string]: string } = {};

    public constructor(uri?: Uri) {
        if (uri) {
            this.setScheme(uri.scheme)
                .setHost(uri.host)
                .setPort(uri.port)
                .setPath(uri.path)
                .addQueryParameters(uri.queryParameters);
        } else {
            this._host = 'localhost';
            this._port = DefaultHttpPort;
            this._scheme = UriScheme.HTTP;
        }
    }

    private static getQuery(queryParameters: { [name: string]: string }): string {
        let result = '';

        for (const queryParameterName in queryParameters) {
            result = result ? `${result}&` : '?';
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
            for (const parameterName in parameters) {
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

    public build(isFullUrl = true): string {
        const query = UriBuilder.getQuery(this._queryParameters);
        const pathAndQuery = this._path + query;

        if (isFullUrl && (this._scheme != UriScheme.Unknown)) {
            const schemeAndHostAndPort = !this._port || UriBuilder.isDefaultPort(this._scheme, this._port)
                ? `${UriScheme[this._scheme].toLowerCase()}://${this._host}`
                : `${UriScheme[this._scheme].toLowerCase()}://${this._host}:${this._port}`;

            return pathAndQuery
                ? ((pathAndQuery.indexOf('/') == 0) ? (schemeAndHostAndPort + pathAndQuery) : `${schemeAndHostAndPort}/${pathAndQuery}`)
                : schemeAndHostAndPort;
        }

        return pathAndQuery;
    }
}