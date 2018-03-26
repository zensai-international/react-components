import { Grid } from './grid';

export class GridExpander {
    private readonly _grid: Grid;

    public constructor(grid: Grid) {
        this._grid = grid;
    }

    public expandOrCollapse(item: any) {
        const state = this._grid.state;
        const index = state.expandedItems.indexOf(item);
        const expandedItems = state.expandedItems;

        if (index != -1) {
            expandedItems.splice(index, 1);
        } else {
            expandedItems.push(item);
        }

        this._grid.setState({ expandedItems });
    }

    public isExpanded(item: any): boolean {
        return (this._grid.state.expandedItems.indexOf(item) != -1);
    }
}