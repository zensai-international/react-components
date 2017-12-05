import { expect } from 'chai';
import { UriParser } from '../../src/infrastructure/uri-parser';

export default describe('UriParser', () => {
    describe('queryParameters', () => {
        it('if only one query parameter', () => {
            const uri = new UriParser().parse('/path?p0=0');
    
            expect(uri.query).to.be.equal('p0=0');
            expect(uri.queryParameters['p0']).to.be.equal('0');
        });

        it('if parameter contains "=" char', () => {
            const uri = new UriParser().parse('/path?$select=p0($select=p00)');

            expect(uri.query).to.be.equal('$select=p0($select=p00)');
            expect(uri.queryParameters['$select']).to.be.equal('p0($select=p00)');
        });
    });
});