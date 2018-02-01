import * as React from 'react';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridBodyCell } from './grid-body-cell';
import { GridHeaderCell } from './grid-header-cell';

export class GridSelectorColumn<P extends GridColumnProps = GridColumnProps> extends GridColumn<P> {
    public static defaultProps: Partial<GridColumnProps> = {
        body: {
            template: (item: any, column: GridSelectorColumn<GridColumnProps>, cell: GridBodyCell) => column.renderBody(item, cell)
        },
        header: {
            template: (column: GridSelectorColumn<GridColumnProps>, cell: GridHeaderCell) => column.renderHeader(cell)
        },
        isSortable: false,
        title: ''
    };

    protected renderHeader(cell: GridHeaderCell): JSX.Element | JSX.Element[] | string {
        const isSelectedItem = cell.context.gridState.selection.unselectedItems != null;

        return <input checked={isSelectedItem} type="checkbox" />;
    }

    protected renderBody(item: any, cell: GridBodyCell): JSX.Element | JSX.Element[] | string {
        const isSelectedItem = cell.props.isSelectedItem;

        return <input checked={isSelectedItem} type="checkbox" />;
    }
}