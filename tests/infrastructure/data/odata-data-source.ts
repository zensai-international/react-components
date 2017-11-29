import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonPromise from 'sinon-promise';
import { DataSourceState } from '../../../src/infrastructure/data/data-source';
import { ODataDataSource } from '../../../src/infrastructure/data/odata-data-source';
import { SortDirection } from '../../../src/infrastructure/data/common';

sinonPromise(sinon);

const totalCount = 10;
const serviceResult = {
    '@odata.count': totalCount,
    'value': [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }]
};
const serviceUrl = 'https://service/models';
const fieldMappings = { 'field': 'mappedField' };

function getData(): Promise<any> {
    return new Promise((resolve: (value?: any) => void) => {
        resolve(serviceResult);
    });
}

export default describe('ODataDataSource', () => {
    describe('dataBind', () => {
        it('default behaviour', () => {
            const dataSource = new ODataDataSource<any>({ dataGetter: getData, url: serviceUrl });
            
            expect(dataSource.view, 'view').to.be.null;
            expect(dataSource.state, 'state').to.equal(DataSourceState.Empty);

            dataSource.dataBind()
                .then(view => {
                    expect(view, 'view').to.be.not.null;
                    expect(dataSource.state, 'state').to.equal(DataSourceState.Bound);
        
                    expect(view.data[0].field).to.equal('value0');
                    expect(view.data[1].field).to.equal('value1');
                    expect(view.data[2].field).to.equal('value2');

                    expect(dataSource.totalCount, 'totalCount').to.equal(totalCount);
                });
        });

        it(`generated url depends on call times`, () => {
            const dataGetter = sinon.promise().resolves(serviceResult);
            const dataSource = new ODataDataSource<any>({ dataGetter: dataGetter, url: serviceUrl });

            dataSource.dataBind();
            dataSource.dataBind();

            expect(dataGetter.withArgs(`${serviceUrl}?$count=true`).calledOnce).to.be.true;
            expect(dataGetter.withArgs(serviceUrl).calledOnce).to.be.true;
        });
    });

    describe('sort', () => {
        describe('default behaviour', () => {
            it ('ascending sorting by one field', () => {
                const dataGetter = sinon.promise();
                const dataSource = new ODataDataSource({ dataGetter: dataGetter, url: serviceUrl });

                dataSource.sort({ direction: SortDirection.Ascending, field: 'field' });
                dataSource.dataBind()
                    .then(view => {
                        expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                        expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
                        expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
        
                        expect(dataGetter.calledWith(`${serviceUrl}?$count=true&$orderby=field%20asc`)).to.be.true;
                    });
            });

            it ('ascending sorting by one field if there is field mapping', () => {
                const dataGetter = sinon.promise();
                const dataSource = new ODataDataSource({ dataGetter: dataGetter, fieldMappings: fieldMappings, url: serviceUrl });

                dataSource.sort({ direction: SortDirection.Ascending, field: 'field' });
                dataSource.dataBind();

                expect(dataGetter.calledWith(`${serviceUrl}?$count=true&$orderby=mappedField%20asc`)).to.be.true;
            });

            it ('descending sorting by one field', () => {
                const dataGetter = sinon.promise();
                const dataSource = new ODataDataSource({ dataGetter: dataGetter, url: serviceUrl });

                dataSource.sort({ direction: SortDirection.Descending, field: 'field' });
                dataSource.dataBind()
                    .then(view => {
                        expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                        expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Descending);
                        expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
        
                        expect(dataGetter.calledWith(`${serviceUrl}?$count=true&$orderby=field%20desc`)).to.be.true;
                    });
            });

            it ('descending sorting by one field if there is field mapping', () => {
                const dataGetter = sinon.promise();
                const dataSource = new ODataDataSource({ dataGetter: dataGetter, fieldMappings: fieldMappings, url: serviceUrl });

                dataSource.sort({ direction: SortDirection.Descending, field: 'field' });
                dataSource.dataBind();

                expect(dataGetter.calledWith(`${serviceUrl}?$count=true&$orderby=mappedField%20desc`)).to.be.true;
            });
        });
    });
});