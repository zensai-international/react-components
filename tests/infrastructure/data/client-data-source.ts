import { expect } from 'chai';
import { DataType, SortDirection } from '../../../src/infrastructure/data/common';
import { ClientDataSource } from '../../../src/infrastructure/data/client-data-source';
import { DataSourceState, DataViewMode } from '../../../src/infrastructure/data/data-source';
import { TypeConverterProvider } from '../../../src/infrastructure/type-converter';
import { ComparisonOperator } from '../../../src/infrastructure/expressions/expression';

export default describe('ClientDataSource', () => {
    describe('dataBind', () => {
        it('default behavior', async () => {
            const data = [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }];
            const dataSource = new ClientDataSource({ data: () => data });

            expect(dataSource.view).to.be.null;
            expect(dataSource.state, 'state').to.equal(DataSourceState.Empty);

            const view = await dataSource.dataBind();

            expect(view).to.be.not.null;
            expect(dataSource.state, 'state').to.equal(DataSourceState.Bound);

            expect(view.data[0].field).to.equal('value0');
            expect(view.data[1].field).to.equal('value1');
            expect(view.data[2].field).to.equal('value2');
        });

        it('if data is promise', async () => {
            const data = new Promise((resolve: (value?: any) => void) => {
                resolve([{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }]);
            });
            const dataSource = new ClientDataSource<{ field: string }>({ data: data });

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
        const dataSource = new ClientDataSource({ data: () => data });

        dataSource.filter({ field: 'field', operator: ComparisonOperator.Equal, value: 'value0' });

        const view = await dataSource.dataBind();

        expect(view.data.length).to.equal(1);
        expect(view.data[0].field).to.equal('value0');
    });

    it('group', async () => {
        const data = [
            { field0: '00', field1: '01' }, { field0: '00', field1: '01' },
            { field0: '10', field1: '11' }, { field0: '10', field1: '11' }
        ];
        const dataSource = new ClientDataSource({ data: () => data });

        dataSource.group({ fields: ['field0', 'field1'] });

        const view = await dataSource.dataBind();

        expect(view.data.length).to.equal(2);
        expect(view.data[0].field0, 'view.data[0].field0').to.equal('00');
        expect(view.data[0].field1, 'view.data[0].field0').to.equal('01');
        expect(view.data[1].field0, 'view.data[0].field0').to.equal('10');
        expect(view.data[1].field1, 'view.data[0].field0').to.equal('11');
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

            it('default behavior', async () => {
                const dataSource = new ClientDataSource({
                    data: () => data,
                    view: { page: { size: 1 } }
                });

                const view = await dataSource.dataBind();

                expect(view.mode, 'mode').to.equal(DataViewMode.CurrentPage);
                expect(view.page.index, 'page.index').to.equal(0);
                expect(view.data.length, 'data.length').to.equal(1);
            });

            it('if page size is 1', () => {
                [{ pageIndex: 0 }, { pageIndex: 1 }, { pageIndex: 2 }]
                    .forEach(async x => {
                        const dataSource = new ClientDataSource({
                            data: () => data,
                            view: { page: { size: 1 } }
                        });

                        dataSource.setPageIndex(x.pageIndex);

                        const view = await dataSource.dataBind();

                        expect(view.page.index, 'page.index').to.equal(x.pageIndex);
                        expect(view.data.length, 'data.length').to.equal(1);
                        expect(view.data[0].field, 'data[0].field').to.equal('value' + x.pageIndex);
                    });
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

            it('default behavior', async () => {
                const dataSource = new ClientDataSource({
                    data: () => data,
                    view: {
                        mode: DataViewMode.FromFirstToCurrentPage,
                        page: { size: 1 }
                    }});

                const view = await dataSource.dataBind();

                expect(view.mode, 'mode').to.equal(DataViewMode.FromFirstToCurrentPage);
                expect(view.page.index, 'page.index').to.equal(0);
                expect(view.data.length, 'data.length').to.equal(1);
            });

            it('if page size is 1', () => {
                [{ pageIndex: 0 }, { pageIndex: 1 }, { pageIndex: 2 }]
                    .forEach(async x => {
                        const dataSource = new ClientDataSource({
                            data: () => data,
                            view: {
                                mode: DataViewMode.FromFirstToCurrentPage,
                                page: { size: 1 }
                            }});

                        dataSource.setPageIndex(x.pageIndex);

                        const view = await dataSource.dataBind();

                        expect(view.page.index, 'page.index').to.equal(x.pageIndex);
                        expect(view.data.length, `pageIndex: ${x.pageIndex}, data.length`).to.equal(x.pageIndex + 1);

                        for (let i = 0; i < x.pageIndex; i++) {
                            expect(view.data[i].field, `pageIndex: ${x.pageIndex}, data[${i}].field`).to.equal(`value${i}`);
                        }
                    });
            });
        });
    });

    describe('sort', () => {
        describe('default behavior', () => {
            it('ascending sorting by one field', async () => {
                const dataSource = new ClientDataSource({ data: () => [] });

                dataSource.sort([{ direction: SortDirection.Ascending, field: 'field' }]);

                const view = await dataSource.dataBind();

                expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
                expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
            });

            it('descending sorting by one field', async () => {
                const dataSource = new ClientDataSource({ data: () => [] });

                dataSource.sort([{ direction: SortDirection.Descending, field: 'field' }]);

                const view = await dataSource.dataBind();

                expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Descending);
                expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('field');
            });
        });

        describe('by one "boolean" field', () => {
            const testCases = [
                [{ booleanField: true }, { booleanField: false }, { booleanField: null }],
                [{ booleanField: null }, { booleanField: true }, { booleanField: false }],
                [{ booleanField: null }, { booleanField: false }, { booleanField: true }]
            ];

            it('ascending sorting', () => {
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'booleanField' }]);

                    const view = await dataSource.dataBind();

                    expect(view.data[0].booleanField).to.equal(null);
                    expect(view.data[1].booleanField).to.equal(false);
                    expect(view.data[2].booleanField).to.equal(true);
                });
            });

            it('descending sorting', () => {
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'booleanField' }])

                    const view = await dataSource.dataBind();

                    expect(view.data[0].booleanField).to.equal(true);
                    expect(view.data[1].booleanField).to.equal(false);
                    expect(view.data[2].booleanField).to.equal(null);
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
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'numberField' }])

                    const view = await dataSource.dataBind();

                    expect(view.data[0].numberField).to.equal(0);
                    expect(view.data[1].numberField).to.equal(1);
                    expect(view.data[2].numberField).to.equal(2);
                });
            });

            it('descending sorting', () => {
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'numberField' }])

                    const view = await dataSource.dataBind();

                    expect(view.data[0].numberField).to.equal(2);
                    expect(view.data[1].numberField).to.equal(1);
                    expect(view.data[2].numberField).to.equal(0);
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
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'stringField' }]);
                    dataSource.dataBind();

                    const view = await dataSource.dataBind();

                    expect(view.data[0].stringField).to.equal('value0');
                    expect(view.data[1].stringField).to.equal('value1');
                    expect(view.data[2].stringField).to.equal('value2');
                });
            });

            it('descending sorting', () => {
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'stringField' }]);

                    const view = await dataSource.dataBind();

                    expect(view.data[0].stringField).to.equal('value2');
                    expect(view.data[1].stringField).to.equal('value1');
                    expect(view.data[2].stringField).to.equal('value0');
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
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x, fieldAccessor: fieldAccessor });

                    dataSource.sort([{ direction: SortDirection.Ascending, field: 'dateField' }]);

                    const view = await dataSource.dataBind();

                    expect(view.data[0].dateField).to.equal('3/1/2001');
                    expect(view.data[1].dateField).to.equal('2/1/2002');
                    expect(view.data[2].dateField).to.equal('1/1/2003');
                });
            });

            it('descending sorting', () => {
                testCases.forEach(async x => {
                    const dataSource = new ClientDataSource({ data: () => x, fieldAccessor: fieldAccessor });

                    dataSource.sort([{ direction: SortDirection.Descending, field: 'dateField' }]);

                    const view = await dataSource.dataBind();

                    expect(view.data[0].dateField).to.equal('1/1/2003');
                    expect(view.data[1].dateField).to.equal('2/1/2002');
                    expect(view.data[2].dateField).to.equal('3/1/2001');
                });
            });
        });

        describe('clear previous sorting', async () => {
            const data = [{ stringField: 'value0' }, { stringField: 'value1' }, { stringField: 'value2' }];
            const dataSource = new ClientDataSource({ data: () => data });

            dataSource.sort([{ direction: SortDirection.Descending, field: 'stringField' }]);
            dataSource.dataBind();

            dataSource.sort([]);

            const view = await dataSource.dataBind();

            expect(view.data[0].stringField).to.equal('value0');
            expect(view.data[1].stringField).to.equal('value1');
            expect(view.data[2].stringField).to.equal('value2');
        });
    });
});