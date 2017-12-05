import { expect } from 'chai';
import { UriScheme } from '../../src/infrastructure/uri';
import { UriBuilder } from '../../src/infrastructure/uri-builder';

export default describe('UriBuilder', () => {
    describe('addParameter', () => {
        it('if use one time', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder.addQueryParameter('p0', '0');

            expect(uriBuilder.build(false)).to.be.equal('?p0=0');
        });

        it('if use two times', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder
                .addQueryParameter('p0', '0')
                .addQueryParameter('p1', '1');

            expect(uriBuilder.build(false)).to.be.equal('?p0=0&p1=1');
        });

        it('if parameter needs encoding', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder.addQueryParameter('p0', ' ');

            expect(uriBuilder.build(false)).to.be.equal('?p0=%20');
        });
    });

    describe('setPort', () => {
        it('if scheme is "http" and port is "80"', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder
                .setScheme(UriScheme.HTTP)
                .setPort(80);

            expect(uriBuilder.build()).to.be.equal('http://localhost');
        });

        it('if scheme is "http" and port is not "80"', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder
                .setScheme(UriScheme.HTTP)
                .setPort(11);

            expect(uriBuilder.build()).to.be.equal('http://localhost:11');
        });

        it('if scheme is "https" and port is "443"', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder
                .setScheme(UriScheme.HTTPS)
                .setPort(443);

            expect(uriBuilder.build()).to.be.equal('https://localhost');
        });

        it('if scheme is "https" and port is not "443"', () => {
            const uriBuilder = new UriBuilder();

            uriBuilder
                .setScheme(UriScheme.HTTPS)
                .setPort(11);

            expect(uriBuilder.build()).to.be.equal('https://localhost:11');
        });
    });
});