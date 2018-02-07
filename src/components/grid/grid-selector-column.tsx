import * as React from 'react';
import { GridSelection } from './grid';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridBodyCell } from './grid-body-cell';
import { GridHeaderCell } from './grid-header-cell';
import { GridSelectionMode } from '../../index';

export class GridSelectorColumn<P extends GridColumnProps = GridColumnProps> extends GridColumn<P> {
    public static defaultProps: Partial<GridColumnProps> = {
        body: {
            template: (item: any, column: GridSelectorColumn<GridColumnProps>, cell: GridBodyCell) => column.renderBodyContent(item, cell)
        },
        header: {
            template: (column: GridSelectorColumn<GridColumnProps>, cell: GridHeaderCell) => column.renderHeaderContent(cell)
        },
        isSortable: false,
        title: ''
    };

    public constructor(props: P, context: any) {
        super(props, context);

        this.handleSelectOrUnselectAll = this.handleSelectOrUnselectAll.bind(this);
    }

    protected handleSelectOrUnselectAll() {
        const selection = GridSelection.isAllSelected(this.context.grid.state.selection)
            ? GridSelection.UnselectedAll()
            : GridSelection.SelectedAll();

        this.context.grid.setState({ selection: selection });
    }

    protected renderHeaderContent(cell: GridHeaderCell): JSX.Element | JSX.Element[] | string {
        const grid = cell.context.grid;
        debugger;
        const isAllSelected = GridSelection.isAllSelected(grid.state.selection);

        return (grid.props.selectionMode == GridSelectionMode.Multiple)
            ? <input checked={isAllSelected} onClick={this.handleSelectOrUnselectAll} type="checkbox" />
            : null;
    }

    protected renderBodyContent(item: any, cell: GridBodyCell): JSX.Element | JSX.Element[] | string {
        return <input checked={cell.props.isSelected} type="checkbox" />;
    }
}