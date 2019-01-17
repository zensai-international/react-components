import { expect } from 'chai';
import { ClientDataSource, ComparisonOperator, table } from '../../src';

export default describe('GridSelector', () => {
    describe('isAllSelected', () => {
        it('if there are no items', () => {
            const dataSource = new ClientDataSource({ data: [] });
            const grid = new table.Grid({ dataSource });

            dataSource.dataBind();

            const isAllSelected = grid.selector.isAllSelected();

            expect(isAllSelected, 'isAllSelected').is.false;
        });

        it('if there is filter and only filtered items are selected', () => {
            const item0 = { title: 'title0' };
            const item1 = { title: 'title1' };
            const dataSource = new ClientDataSource({
                data: [item0, item1],
                view: { filteredBy: { field: 'title', operator: ComparisonOperator.Equal, value: item0.title } },
            });
            const grid = new table.Grid({ dataSource, selectedItems: [item1] });

            dataSource.dataBind();

            const isAllSelected = grid.selector.isAllSelected();

            expect(isAllSelected, 'isAllSelected').is.true;
        });

        it('if there is paging and first page is selected', () => {
            const item0 = { };
            const item1 = { };
            const dataSource = new ClientDataSource({
                data: [item0, item1],
                view: { page: { size: 1 } },
            });
            const grid = new table.Grid({ dataSource, selectedItems: [item0] });

            dataSource.dataBind();

            const isAllSelected = grid.selector.isAllSelected();

            expect(isAllSelected, 'isAllSelected').is.false;
        });
    });

    describe('selectAll', () => {
        it('default behavior', async () => {
            const data = [];
            const dataSource = new ClientDataSource({ data });
            const grid = new table.Grid({ dataSource });

            await dataSource.dataBind();

            const selectedItems = await grid.selector.selectAll();

            expect(selectedItems, 'selectedItems').to.not.equal(data);
        });
    });
});