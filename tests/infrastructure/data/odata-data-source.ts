import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonPromise from 'sinon-promise';
import { SortDirection } from '../../../src/infrastructure/data/common';
import { DataSourceState, DataViewMode } from '../../../src/infrastructure/data/data-source';
import { ODataDataSource } from '../../../src/infrastructure/data/odata-data-source';

sinonPromise(sinon);

const totalCount = 3;
const serviceResult = {
    '@odata.count': totalCount,
    value: [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }],
};
const serviceUrl = 'https://service/models';
const fieldMappings = { field: 'mappedField' };

function getData(): Promise<any> {
    return new Promise((resolve: (value?: any) => void) => {
        resolve(serviceResult);
    });
}

function getPageData(): () => Promise<any> {
    let pageIndex = 0;

    return () => new Promise((resolve: (value?: any) => void) => {
        resolve({
            '@odata.count': totalCount,
            value: [{ field: `value${pageIndex}` }],
        });

        pageIndex++;
    });
}

export default describe('ODataDataSource', () => {
    describe('dataBind', () => {
        it('default behavior', async () => {
            const dataSource = new ODataDataSource<any>({ data: getData, url: serviceUrl });

            expect(dataSource.view, 'view').to.be.null;
            expect(dataSource.state, 'state').to.equal(DataSourceState.Empty);

            const view = await dataSource.dataBind();

            expect(view, 'view').to.be.not.null;
            expect(dataSource.state, 'state').to.equal(DataSourceState.Bound);

            expect(view.data[0].field).to.equal('value0');
            expect(view.data[1].field).to.equal('value1');
            expect(view.data[2].field).to.equal('value2');

            expect(dataSource.view.totalCount, 'totalCount').to.equal(totalCount);
        });

        it('generated url depends on call times', async () => {
            const data = sinon.promise().resolves(serviceResult);
            const dataSource = new ODataDataSource<any>({ data, url: serviceUrl });

            await dataSource.dataBind();
            await dataSource.dataBind();

            expect(data.withArgs(`${serviceUrl}?$count=true`).calledOnce).to.be.true;
            expect(data.withArgs(serviceUrl).calledOnce).to.be.true;
        });
    });

    describe('setPageIndex', () => {
        it(`if page index is x generated url must be '${serviceUrl}?$count=true&$skip=x&$top=1'`, async () => {
            const testCases = [{ pageIndex: 0 }, { pageIndex: 1 }, { pageIndex: 2 }];
            const data = sinon.promise().resolves(getData);
            const dataSource = new ODataDataSource<any>({
                data,
                view: { page: { size: 1 } },
                url: serviceUrl,
            });

            for (let i = 0; i < testCases.length; i++) {
                const pageIndex = testCases[i].pageIndex;
                const generatedUrl = `${serviceUrl}?$count=true&$skip=${pageIndex}&$top=1`;

                dataSource.setPageIndex(pageIndex);

                await dataSource.dataBind();

                expect(data.withArgs(generatedUrl).calledOnce, generatedUrl).to.be.true;
            }
        });

        describe('if "DataViewMode" is "CurrentPage"', () => {
            it('default behavior', async () => {
                const dataSource = new ODataDataSource<any>({ data: getData, url: serviceUrl });
                const view = await dataSource.dataBind();

                expect(view.page.index, 'page.index').to.equal(0);
                expect(view.data.length, 'data.length').to.equal(totalCount);
            });

            it('if page index is 1', async () => {
                const dataSource = new ODataDataSource<any>({
                    data: getPageData(),
                    url: serviceUrl,
                    view: { mode: DataViewMode.CurrentPage },
                });

                await dataSource.dataBind();
                dataSource.setPageIndex(1);

                const view = await dataSource.dataBind();

                expect(view.page.index, 'page.index').to.equal(1);
                expect(view.data.length, 'data.length').to.equal(1);

                expect(view.data[0].field, 'data[0].field').to.equal('value1');
            });
        });

        describe('if "DataViewMode" is "FromFirstToCurrentPage"', () => {
            it('default behavior', async () => {
                const dataSource = new ODataDataSource<any>({
                    data: getData,
                    url: serviceUrl,
                    view: { mode: DataViewMode.FromFirstToCurrentPage },
                });

                const view = await dataSource.dataBind();

                expect(view.page.index, 'page.index').to.equal(0);
                expect(view.data.length, 'data.length').to.equal(totalCount);
            });

            it('if page size is 1', async () => {
                const dataSource = new ODataDataSource<any>({
                    data: getPageData(),
                    url: serviceUrl,
                    view: { mode: DataViewMode.FromFirstToCurrentPage },
                });

                await dataSource.dataBind();
                dataSource.setPageIndex(1);

                const view = await dataSource.dataBind();

                expect(view.page.index, 'page.index').to.equal(1);
                expect(view.data.length, 'view.data.length').to.equal(2);

                expect(view.data[0].field, 'view.data[0].field').to.equal('value0');
                expect(view.data[1].field, 'view.data[1].field').to.equal('value1');
            });
        });
    });

    describe('sort', () => {
        it('default behavior', async () => {
            const dataSource = new ODataDataSource({
                data: getData,
                url: serviceUrl,
                view: {
                    sortedBy: [{ direction: SortDirection.Ascending, field: 'field' }],
                },
            });

            const view = await dataSource.dataBind();

            expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
            expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
            expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
        });

        it('ascending sorting by one field', async () => {
            const data = sinon.promise().resolves(getData);
            const dataSource = new ODataDataSource({ data, url: serviceUrl });

            dataSource.sort([{ direction: SortDirection.Ascending, field: 'field' }]);

            const view = await dataSource.dataBind();

            expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
            expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
            expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');

            expect(data.calledWith(`${serviceUrl}?$count=true&$orderby=field%20asc`)).to.be.true;
        });

        it('ascending sorting by one field if there is field mapping', async () => {
            const data = sinon.promise().resolves(getData);
            const dataSource = new ODataDataSource({ data, fieldMappings, url: serviceUrl });

            dataSource.sort([{ direction: SortDirection.Ascending, field: 'field' }]);

            await dataSource.dataBind();

            expect(data.calledWith(`${serviceUrl}?$count=true&$orderby=mappedField%20asc`)).to.be.true;
        });

        it('descending sorting by one field', async () => {
            const data = sinon.promise().resolves(getData);
            const dataSource = new ODataDataSource({ data, url: serviceUrl });

            dataSource.sort([{ direction: SortDirection.Descending, field: 'field' }]);

            const view = await dataSource.dataBind();

            expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
            expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Descending);
            expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');

            expect(data.calledWith(`${serviceUrl}?$count=true&$orderby=field%20desc`)).to.be.true;
        });

        it('descending sorting by one field if there is field mapping', async () => {
            const data = sinon.promise().resolves(getData);
            const dataSource = new ODataDataSource({ data, fieldMappings, url: serviceUrl });

            dataSource.sort([{ direction: SortDirection.Descending, field: 'field' }]);

            await dataSource.dataBind();

            expect(data.calledWith(`${serviceUrl}?$count=true&$orderby=mappedField%20desc`)).to.be.true;
        });

        it('if page size is 1 and page index is 1', async () => {
            const dataSource = new ODataDataSource<any>({
                data: getPageData(),
                view: {
                    mode: DataViewMode.FromFirstToCurrentPage,
                    page: { index: 1 },
                },
                url: serviceUrl,
            });

            dataSource.dataBind();
            dataSource.sort([{ direction: SortDirection.Descending, field: 'field' }]);

            const view = await dataSource.dataBind();

            expect(view.page.index, 'page.index').to.equal(0);
            expect(view.data.length, 'view.data.length').to.equal(1);
        });
    });
});