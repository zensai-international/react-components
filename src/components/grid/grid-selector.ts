import { Grid, GridSelectionMode } from './grid';

export class GridSelector {
    private _grid: Grid;

    public constructor(grid: Grid) {
        this._grid = grid;
    }

    public selectOrUnselect(item: any) {
        const grid = this._grid;
        const gridProps = grid.props;

        if (gridProps.selectionMode != GridSelectionMode.None) {
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
        const dataSource = this._grid.props.dataSource;

        if (!dataSource.view) {
            return false;
        }

        const allItems = dataSource.view.allData || dataSource.view.data;

        return (allItems.length > 0) && (this._grid.state.selectedItems.length == allItems.length);
    }

    public selectAll() {
        const dataSource = this._grid.props.dataSource;

        if (dataSource.view) {
            const allItems = (dataSource.view.allData || dataSource.view.data).map(x => x);
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