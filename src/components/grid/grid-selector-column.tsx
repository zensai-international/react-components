import * as React from 'react';
import { GridSelection } from './grid';
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
        const isSelected = cell.context.gridState.selection == GridSelection.SelectedAll;

        return <input checked={isSelected} type="checkbox" />;
    }

    protected renderBody(item: any, cell: GridBodyCell): JSX.Element | JSX.Element[] | string {
        return <input checked={cell.props.isSelected} type="checkbox" />;
    }
}