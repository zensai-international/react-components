import { parse } from 'url';
import { Uri, UriScheme } from './uri';

export class UriParser {
    public static readonly currentUri: Uri = new UriParser().parse(window.location.href);

    private static getQueryParameters(query: string): { [name: string]: string } {
        const hashes = query.split('&');
        let result = {};

        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            const index = hash.indexOf('=');
            const parameterName = hash.substr(0, index);
            const parameterValue = hash.substr(index + 1, hash.length - parameterName.length);

            result[parameterName] = decodeURIComponent(parameterValue);
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