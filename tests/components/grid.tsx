import * as Enzyme from 'enzyme';
import { expect } from 'chai';
import * as React from 'react';
import { GridColumn } from '../../src/components/grid/grid-column';
import { Grid } from '../../src/components/grid/table/grid';
import { SortDirection } from '../../src/infrastructure/data/common';
import { ClientDataSource } from '../../src/infrastructure/data/client-data-source';
import { DataSource } from '../../src/infrastructure/data/data-source';
import { GridSelectionMode, GridState } from '../../src/index';
//import { GridBodyRow, GridBodyRowProps } from '../../src/components/grid/grid-body-row';

export default describe('<Grid />', () => {
    describe('behavior', () => {
        describe('selection', () => {
            function createGrid(selectionMode: GridSelectionMode): Enzyme.ReactWrapper<any, GridState> {
                return Enzyme.mount(
                    <Grid autoBind={true} dataSource={dataSource} selectionMode={selectionMode}>
                        <GridColumn
                            body={{ style: { className: 'title-body' } }}
                            header={{ style: { className: 'title-header' } }}
                            field="title"
                            title="Title" />
                    </Grid>
                );
            }

            const data = [{ title: 'title0' }, { title: 'title1' }, { title: 'title2' }];
            const dataSource: DataSource = new ClientDataSource({ data: () => data });

            describe('if selection mode is single', () => {
                let grid: Enzyme.ReactWrapper<any, GridState>;

                beforeEach(() => {
                    grid = createGrid(GridSelectionMode.Single);
                });

                it('one click on first row', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(1);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[0]);
                });

                it('one click on first row and one click to last row', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click')
                    grid.find('.title-body').last().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(1);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[data.length - 1]);
                });
            });

            describe('if selection mode is multiple', () => {
                let grid: Enzyme.ReactWrapper<any, GridState>;

                beforeEach(() => {
                    grid = createGrid(GridSelectionMode.Multiple);
                });

                it('one click on first row', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(1);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[0]);
                });

                it('one click on first row and one click to last row', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click')
                    grid.find('.title-body').last().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(2);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[0]);
                    expect(selectedItems[1], 'selectedItems[1]').to.equal(data[data.length - 1]);
                });
            });
        });

        describe('sorting', () => {
            let dataSource: DataSource;
            let grid: Enzyme.ReactWrapper;

            beforeEach(() => {
                dataSource = new ClientDataSource({ data: () => [] });

                grid = Enzyme.mount(
                    <Grid autoBind={true} dataSource={dataSource}>
                        <GridColumn
                            field="title"
                            header={{ style: { title: { className: 'title' } } }}
                            title="Title" />
                        <GridColumn
                            field="description"
                            header={{ style: { title: { className: 'description' } } }}
                            title="Description" />
                    </Grid>
                );
            });

            it('one click on first column', () => {
                grid.find('.title').simulate('click');

                const view = dataSource.view;

                expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
                expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('title');
            });

            it('one click on first column and one click by last column', () => {
                grid.find('.title').simulate('click');
                grid.find('.description').simulate('click');

                const view = dataSource.view;

                expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
                expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('description');
            });

            it('two click on first column', () => {
                grid.find('.title')
                    .simulate('click')
                    .simulate('click');

                const view = dataSource.view;

                expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Descending);
                expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('title');
            });

            it('three click on first column', () => {
                grid.find('.title')
                    .simulate('click')
                    .simulate('click')
                    .simulate('click');

                const view = dataSource.view;

                expect(view.sortedBy.length).to.equal(0, 'sortedBy.length');
            });

            it('two click on first column and one click on last column', () => {
                grid.find('.title')
                    .simulate('click')
                    .simulate('click');
                grid.find('.description')
                    .simulate('click');

                const view = dataSource.view;

                expect(view.sortedBy.length, 'sortedBy.length').to.equal(1);
                expect(view.sortedBy[0].direction, 'sortedBy[0].direction').to.equal(SortDirection.Ascending);
                expect(view.sortedBy[0].field, 'sortedBy[0].field').to.equal('description');
            });
        });

        // describe('expand/collapse rows', () =>{
        //     let dataSource: DataSource<any>;
        //     let grid;
            
        //     beforeEach(() => {
        //         dataSource = new ClientDataSource({ dataGetter: () => [{ title: 'title 1', subItems: [{ title: 'sub title 1' }] }] });
        //         dataSource.dataBind();
        //         const columns = [
        //                         new GridColumn({ body: { template: () => "" } }),
        //                         new GridColumn({ field: "title", title: "Title" }),
        //                     ];

        //         grid = Enzyme.mount(
        //             <Grid dataSource={dataSource}>
        //                 <GridExpandContentColumn renderDetails={(rowType: { new (): GridBodyRow<GridBodyRowProps, any> }, index: number, item: any) => {
        //                     const Row = rowType;
        //                     const childDataSource = new ClientDataSource<any>({ dataGetter: () => item.subItems });
        //                     childDataSource.dataBind();

        //                     return item.subItems.map(v =>
        //                         <Row columns={columns} dataSource={childDataSource} style={DefaultStyle.body.dataRow} index={index} item={v} />
        //                     )

        //                 }} />
        //                 <GridColumn field="title" title="Title" />
        //             </Grid>
        //         );
        //     });

        //      it('click on expand/collapse content', () => {
        //         expect(grid.find('tr').length).to.equal(1, 'rows count');

        //         grid.find('td a')
        //             .first()
        //             .simulate('click');
        //         expect(grid.find('tr').length).to.equal(2, 'rows and subrows count');

        //         grid.find('td a')
        //             .first()
        //             .simulate('click');

        //         expect(grid.find('tr').length).to.equal(1, 'rows and subrows count');
        //     });
        // })
    });

    describe('column properties', () => {
        describe('body', () => {
            it('style', () => {
                const grid = Enzyme.mount(
                    <Grid autoBind={true} dataSource={new ClientDataSource({ data: () => [{}] })}>
                        <GridColumn body={{ style: { className: 'body' } }} field="title" title="Title" />
                    </Grid>
                );

                expect(grid.find('.body').length).to.equal(1);
            });
        });

        describe('header', () => {
            it('style', () => {
                const grid = Enzyme.mount(
                    <Grid autoBind={true} dataSource={new ClientDataSource({ data: () => [{}] })}>
                        <GridColumn header={{ style: { className: 'header', title: { className: 'header-title' } } }} field="title" title="Title" />
                    </Grid>
                );

                expect(grid.find('.header').length, 'header').to.equal(1);
                expect(grid.find('.header > .header-title').length, 'header-title').to.equal(1);
            });
        });
    });
});