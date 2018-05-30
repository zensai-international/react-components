import * as Enzyme from 'enzyme';
import { expect } from 'chai';
import * as React from 'react';
import { ClientDataSource, ComparisonOperator, DataSource, FilterContext, table, GridBodyRow, GridBodyRowProps, GridColumn, GridExpanderColumn, GridProps, GridSelectionMode, GridState, SortDirection } from '../../src/index';

const Grid = table.Grid;

export default describe('<Grid />', () => {
    const data = [{ title: 'title0' }, { title: 'title1' }, { title: 'title2' }];
    let dataSource: DataSource;

    beforeEach(() => {
        dataSource = new ClientDataSource({ data: () => data.map(x => x) });
    });

    describe('behavior', () => {
        describe('expansion', () => {
            function createGrid(isExpandable: boolean = null): Enzyme.ReactWrapper<GridProps, GridState> {
                return Enzyme.mount(
                    <Grid
                        bodyRowTemplate={(rowType: { new (): GridBodyRow }, props: GridBodyRowProps) => {
                            const Row = rowType;

                            return <Row {...props} isExpandable={isExpandable} />
                        }}
                        dataSource={dataSource}>
                        <GridExpanderColumn body={{ style: { className: 'expander' } }} />
                        <GridColumn field="title" title="Title" />
                    </Grid>
                );
            }

            it('one click on first row (to expand first row)', () => {
                const grid = createGrid();
                const expandedItems = grid.state().expandedItems;

                grid.find('.expander').first().simulate('click');

                expect(expandedItems.length, 'expandedItems.length').to.equal(1);
                expect(expandedItems[0], 'expandedItems[0]').to.equal(data[0]);
            });

            it('two clicks on first row (to expand and collapse first row)', () => {
                const grid = createGrid();
                const expandedItems = grid.state().expandedItems;

                grid.find('.expander').first()
                    .simulate('click')
                    .simulate('click');

                expect(expandedItems.length, 'expandedItems.length').to.equal(0);
            });

            it('one click on first row if row is not expandable', () => {
                const grid = createGrid(false);
                const expandedItems = grid.state().expandedItems;

                grid.find('.expander').first().simulate('click');

                expect(expandedItems.length, 'expandedItems.length').to.equal(0);
            });
        });

        describe('filtering', () => {
            it('if "FilterContext" has expressions', () => {
                const expressionByKey = { ['key1']: { field: 'title', operator: ComparisonOperator.Equal, value: 'title0' } };
                const filterContext = new FilterContext(expressionByKey);

                Enzyme.mount(
                    <Grid dataSource={dataSource} filterContext={filterContext}>
                    </Grid>
                );

                const { filteredBy } = dataSource.view;

                expect(filteredBy).to.equal(expressionByKey['key1']);
            });
        });

        describe('selection', () => {
            function createGrid(props: Partial<GridProps>): Enzyme.ReactWrapper<GridProps, GridState> {
                return Enzyme.mount<GridProps>(
                    <Grid {...props} dataSource={dataSource}>
                        <GridColumn
                            body={{ style: { className: 'title-body' } }}
                            header={{ style: { className: 'title-header' } }}
                            field="title"
                            title="Title" />
                    </Grid>
                );
            }

            describe('if selection mode is single', () => {
                let grid: Enzyme.ReactWrapper<any, GridState>;

                beforeEach(() => {
                    grid = createGrid({ selectionMode: GridSelectionMode.Single });
                });

                it('one click on first row (to select first row)', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(1);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[0]);
                });

                it('two clicks on first row (to select and unselect first row)', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first()
                        .simulate('click')
                        .simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(0);
                });

                it('one click on first row and one click to last row (to select second row)', () => {
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
                    grid = createGrid({ selectionMode: GridSelectionMode.Multiple });
                });

                it('one click on first row (to select first row)', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(1);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[0]);
                });

                it('one click on first row and one click to last row (to select first and second rows)', () => {
                    const selectedItems = grid.state().selectedItems;

                    grid.find('.title-body').first().simulate('click')
                    grid.find('.title-body').last().simulate('click');

                    expect(selectedItems.length, 'selectedItems.length').to.equal(2);
                    expect(selectedItems[0], 'selectedItems[0]').to.equal(data[0]);
                    expect(selectedItems[1], 'selectedItems[1]').to.equal(data[data.length - 1]);
                });
            });

            it('if selected item was deleted', () => {
                const item = data[0];
                const grid = createGrid({ selectedItems: [item] });
                const dataSource = grid.props().dataSource;

                dataSource.delete(item);
                
                expect(grid.state().selectedItems.length, 'selectedItems.length').to.equal(0);
            });
        });

        describe('sorting', () => {
            let grid: Enzyme.ReactWrapper;

            beforeEach(() => {
                grid = Enzyme.mount(
                    <Grid dataSource={dataSource}>
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
    });

    describe('column properties', () => {
        describe('body', () => {
            it('style', () => {
                const grid = Enzyme.mount(
                    <Grid dataSource={dataSource}>
                        <GridColumn body={{ style: { className: 'body' } }} field="title" title="Title" />
                    </Grid>
                );

                expect(grid.find('.body').length).to.equal(dataSource.view.data.length);
            });
        });

        describe('header', () => {
            it('style', () => {
                const grid = Enzyme.mount(
                    <Grid dataSource={dataSource}>
                        <GridColumn header={{ style: { className: 'header', title: { className: 'header-title' } } }} field="title" title="Title" />
                    </Grid>
                );

                expect(grid.find('.header').length, 'header').to.equal(1);
                expect(grid.find('.header > .header-title').length, 'header-title').to.equal(1);
            });
        });
    });
});