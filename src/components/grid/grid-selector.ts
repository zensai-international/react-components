import { Grid, GridSelectionMode } from './grid';
import { DataSourcePager } from '../../infrastructure/data/data-source-pager';

export class GridSelector {
    private _grid: Grid;

    public constructor(grid: Grid) {
        this._grid = grid;
    }

    private getAllItems(): any[] {
        const dataSource = this._grid.props.dataSource;

        if (!dataSource.view) {
            return null;
        }

        const pager = new DataSourcePager(dataSource);

        return (pager.getPageCount() > 1)
            ? dataSource.getView({
                    filteredBy: dataSource.view.filteredBy,
                    sortedBy: dataSource.view.sortedBy
                })
                .data
            : dataSource.view.data;
    }

    public selectOrUnselect(item: any) {
        const grid = this._grid;
        const gridProps = grid.props;

        if (gridProps.selectionMode != null) {
            const selectedItems = grid.state.selectedItems;
            const itemIndex = selectedItems.indexOf(item);

            if (itemIndex != -1) {
                selectedItems.splice(itemIndex, 1);

                grid.setState({ selectedItems: selectedItems }, () => {
                    if (gridProps.onUnselect) {
                        gridProps.onUnselect(grid, [item]);
                    }
                });
            } else {
                if ((gridProps.selectionMode == GridSelectionMode.Single) && selectedItems.length) {
                    selectedItems.length = 0;
                }

                selectedItems.push(item);

                grid.setState({ selectedItems: selectedItems }, () => {
                    if (gridProps.onSelect) {
                        gridProps.onSelect(grid, [item]);
                    }
                });
            }
        }
    }

    public isAllItemsSelected(): boolean {
        const allItems = this.getAllItems();

        return (allItems != null) && (allItems.length > 0) && (this._grid.state.selectedItems.length == allItems.length);
    }

    public selectAll() {
        const allItems = this.getAllItems();

        if (allItems != null) {
            const grid = this._grid;

            grid.setState({ selectedItems: allItems }, () => {
                if (grid.props.onSelect) {
                    grid.props.onSelect(grid, grid.state.selectedItems);
                }
            });
        }
    }

    public selectOrUnselectAll() {
        if (this.isAllItemsSelected()) {
            this.unselectAll();
        } else {
            this.selectAll();
        }
    }

    public unselectAll() {
        const grid = this._grid;

        if (grid.state.selectedItems.length != 0) {
            grid.setState({ selectedItems: [] }, () => {
                if (grid.props.onUnselect) {
                    grid.props.onUnselect(grid, grid.state.selectedItems);
                }
            });
        }
    }
}