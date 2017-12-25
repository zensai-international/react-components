import { expect } from 'chai';
import { DataType, SortDirection } from '../../../src/infrastructure/data/common';
import { ClientDataSource } from '../../../src/infrastructure/data/client-data-source';
import { DataSourceState, DataViewMode } from '../../../src/infrastructure/data/data-source';
import { TypeConverterProvider } from '../../../src/infrastructure/type-converter';
import { ComparisonOperator } from '../../../src/infrastructure/expressions/expression';

export default describe('ClientDataSource', () => {
    describe('dataBind', () => {
        it('default behaviour', async () => {
            const data = [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }];
            const dataSource = new ClientDataSource({ dataGetter: () => data });

            expect(dataSource.view).to.be.null;
            expect(dataSource.state).to.equal(DataSourceState.Empty, 'state');

            const view = await dataSource.dataBind();

            expect(view).to.be.not.null;
            expect(dataSource.state).to.equal(DataSourceState.Bound, 'state');

            expect(view.data[0].field).to.equal('value0');
            expect(view.data[1].field).to.equal('value1');
            expect(view.data[2].field).to.equal('value2');
        });

        it('if dataGetter is promise', async () => {
            const data = [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }];
            const dataGetter = new Promise((resolve: (value?: any) => void) => {
                resolve(data);
            });
            const dataSource = new ClientDataSource({ dataGetter: dataGetter });

            dataSource.dataBind();

            const view = await dataSource.dataBind();

            expect(view).to.be.not.null;
            expect(dataSource.state).to.equal(DataSourceState.Bound, 'state');

            expect(view.data[0].field).to.equal('value0');
            expect(view.data[1].field).to.equal('value1');
            expect(view.data[2].field).to.equal('value2');
        });
    });

    it('filter', async () => {
        const data = [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }];
        const dataSource = new ClientDataSource({ dataGetter: () => data });

        dataSource.filter({ field: 'field', operator: ComparisonOperator.Equal, value: 'value0' });
        const view = await dataSource.dataBind();

        expect(view.data.length).to.equal(1);
        expect(view.data[0].field).to.equal('value0');
    });

    describe('setPageIndex', () => {
        describe('if "DataViewMode" is "CurrentPage"', () => {
            const data = [
                { field: 'value0' },
                { field: 'value1' },
                { field: 'value2' },
                { field: 'value3' },
                { field: 'value4' },
                { field: 'value5' }
            ];

            it('default behaviour', () => {
                const dataSource = new ClientDataSource({ dataGetter: () => data, pageSize: 1 });

                dataSource.dataBind();

                expect(dataSource.view.pageIndex, 'pageIndex').to.equal(0);
                expect(dataSource.view.data.length, 'data.length').to.equal(1);
            });

            it('if page size is 1', () => {
                [{ pageIndex: 0 }, { pageIndex: 1 }, { pageIndex: 2 }]
                    .forEach(x => {
                        const dataSource = new ClientDataSource({ dataGetter: () => data, pageSize: 1 });

                        dataSource.setPageIndex(x.pageIndex);
                        dataSource.dataBind();

                        expect(dataSource.view.pageIndex, 'pageIndex').to.equal(x.pageIndex);
                        expect(dataSource.view.data.length, 'data.length').to.equal(1);
                        expect(dataSource.view.data[0].field, 'data[0].field').to.equal('value' + x.pageIndex);
                    });
            });

            it('if first page size is 1 and page size is 2', () => {
                const dataSource = new ClientDataSource({ dataGetter: () => data, firstPageSize: 1, pageSize: 2, viewMode: DataViewMode.CurrentPage });

                dataSource.setPageIndex(0);
                dataSource.dataBind();

                expect(dataSource.view.data.length).to.equal(1);

                dataSource.setPageIndex(1);
                dataSource.dataBind();

                expect(dataSource.view.data.length).to.equal(2);
            });
        })

        describe('if "DataViewMode" is "FromFirstToCurrentPage"', () => {
            const data = [
                { field: 'value0' },
                { field: 'value1' },
                { field: 'value2' },
                { field: 'value3' },
                { field: 'value4' },
                { field: 'value5' }
            ];

            it('default behaviour', () => {
                const dataSource = new ClientDataSource({ dataGetter: () => data, pageSize: 1, viewMode: DataViewMode.FromFirstToCurrentPage });

                dataSource.dataBind();

                expect(dataSource.view.pageIndex, 'pageIndex').to.equal(0);
                expect(dataSource.view.data.length, 'data.length').to.equal(1);
            });

            it('if page size is 1', () => {
                [{ pageIndex: 0 }, { pageIndex: 1 }, { pageIndex: 2 }]
                    .forEach(x => {
                        const dataSource = new ClientDataSource({ dataGetter: () => data, pageSize: 1, viewMode: DataViewMode.FromFirstToCurrentPage });

                        dataSource.setPageIndex(x.pageIndex);
                        dataSource.dataBind();

                        expect(dataSource.view.pageIndex, 'pageIndex').to.equal(x.pageIndex);
                        expect(dataSource.view.data.length, `pageIndex: ${x.pageIndex}, data.length`).to.equal(x.pageIndex + 1);

                        for (let i = 0; i < x.pageIndex; i++) {
                            expect(dataSource.view.data[i].field, `pageIndex: ${x.pageIndex}, data[${i}].field`).to.equal(`value${i}`);
                        }
                    });
            });

            it('if first page size is 1 and page size is 2', () => {
                const dataSource = new ClientDataSource({ dataGetter: () => data, firstPageSize: 1, pageSize: 2, viewMode: DataViewMode.FromFirstToCurrentPage });

                dataSource.setPageIndex(0)
                dataSource.dataBind();

                expect(dataSource.view.data.length).to.equal(1);

                dataSource.setPageIndex(1)
                dataSource.dataBind();

                expect(dataSource.view.data.length).to.equal(3);
            });
        });
    });

    describe('sort', () => {
        describe('default behaviour', () => {
            it('ascending sorting by one field', () => {
                const dataSource = new ClientDataSource({ dataGetter: () => [] });

                dataSource.sort([{ direction: SortDirection.Ascending, field: 'field' }]);
                dataSource.dataBind();

                expect(dataSource.view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(dataSource.view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
                expect(dataSource.view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
            });

            it('descending sorting by one field', () => {
                const dataSource = new ClientDataSource({ dataGetter: () => [] });

                dataSource.sort([{ direction: SortDirection.Descending, field: 'field' }]);
                dataSource.dataBind();

                expect(dataSource.view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(dataSource.view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Descending);
                expect(dataSource.view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
            });
        });

        describe('by one "boolean" field', () => {
            const testCases = [
                [{ booleanField: true }, { booleanField: false }, { booleanField: null }],
                [{ booleanField: null }, { booleanField: true }, { booleanField: false }],
                [{ booleanField: null }, { booleanField: false }, { booleanField: true }]
            ];

            it('ascending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'booleanField' }]);
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].booleanField).to.equal(null);
                    expect(dataSource.view.data[1].booleanField).to.equal(false);
                    expect(dataSource.view.data[2].booleanField).to.equal(true);
                });
            });

            it('descending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'booleanField' }])
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].booleanField).to.equal(true);
                    expect(dataSource.view.data[1].booleanField).to.equal(false);
                    expect(dataSource.view.data[2].booleanField).to.equal(null);
                });
            });
        });

        describe('by one "number" field', () => {
            const testCases = [
                [{ numberField: 0 }, { numberField: 1 }, { numberField: 2 }],
                [{ numberField: 2 }, { numberField: 0 }, { numberField: 1 }],
                [{ numberField: 2 }, { numberField: 1 }, { numberField: 0 }]
            ];

            it('ascending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'numberField' }])
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].numberField).to.equal(0);
                    expect(dataSource.view.data[1].numberField).to.equal(1);
                    expect(dataSource.view.data[2].numberField).to.equal(2);
                });
            });

            it('descending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'numberField' }])
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].numberField).to.equal(2);
                    expect(dataSource.view.data[1].numberField).to.equal(1);
                    expect(dataSource.view.data[2].numberField).to.equal(0);
                });
            });
        });

        describe('by one "string" field', () => {
            const testCases = [
                [{ stringField: 'value0' }, { stringField: 'value1' }, { stringField: 'value2' }],
                [{ stringField: 'value2' }, { stringField: 'value0' }, { stringField: 'value1' }],
                [{ stringField: 'value2' }, { stringField: 'value1' }, { stringField: 'value0' }]
            ];

            it('ascending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'stringField' }]);
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].stringField).to.equal('value0');
                    expect(dataSource.view.data[1].stringField).to.equal('value1');
                    expect(dataSource.view.data[2].stringField).to.equal('value2');
                });
            });

            it('descending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'stringField' }]);
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].stringField).to.equal('value2');
                    expect(dataSource.view.data[1].stringField).to.equal('value1');
                    expect(dataSource.view.data[2].stringField).to.equal('value0');
                });
            });
        });

        describe('by one "date" field if value is string', () => {
            const typeConverter = TypeConverterProvider.instance.get(DataType.Date);
            const fieldAccessor = {
                getValue(item: any): any {
                    return typeConverter.convert(item.dateField);
                },
                setValue: () => null
            };
            const testCases = [
                [{ dateField: '3/1/2001' }, { dateField: '2/1/2002' }, { dateField: '1/1/2003' }],
                [{ dateField: '1/1/2003' }, { dateField: '3/1/2001' }, { dateField: '2/1/2002' }],
                [{ dateField: '1/1/2003' }, { dateField: '2/1/2002' }, { dateField: '3/1/2001' }]
            ];

            it('ascending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x, fieldAccessor: fieldAccessor });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'dateField' }]);
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].dateField).to.equal('3/1/2001');
                    expect(dataSource.view.data[1].dateField).to.equal('2/1/2002');
                    expect(dataSource.view.data[2].dateField).to.equal('1/1/2003');
                });
            });

            it('descending sorting', () => {
                testCases.forEach(x => {
                    const dataSource = new ClientDataSource({ dataGetter: () => x, fieldAccessor: fieldAccessor });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'dateField' }]);
                    dataSource.dataBind();

                    expect(dataSource.view.data[0].dateField).to.equal('1/1/2003');
                    expect(dataSource.view.data[1].dateField).to.equal('2/1/2002');
                    expect(dataSource.view.data[2].dateField).to.equal('3/1/2001');
                });
            });
        });

        describe('clear previous sorting', () => {
            const data = [{ stringField: 'value0' }, { stringField: 'value1' }, { stringField: 'value2' }];
            const dataSource = new ClientDataSource({ dataGetter: () => data });

            dataSource.sort([{ direction: SortDirection.Descending, field: 'stringField' }]);
            dataSource.dataBind();

            dataSource.sort([]);
            dataSource.dataBind();

            expect(dataSource.view.data[0].stringField).to.equal('value0');
            expect(dataSource.view.data[1].stringField).to.equal('value1');
            expect(dataSource.view.data[2].stringField).to.equal('value2');
        });
    });
});