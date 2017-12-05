import * as React from 'react';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridBodyCell } from './grid-body-cell';

export class GridExpanderColumn<P extends GridColumnProps = GridColumnProps> extends GridColumn<P> {
    public static defaultProps: Partial<GridColumnProps> = {
        body: {
            template: (item: any, column: GridExpanderColumn<GridColumnProps>, cell: GridBodyCell) => column.renderBody(item, cell)
        },
        isSortable: false,
        title: ''
    };

    protected renderBody(item: any, cell: GridBodyCell): JSX.Element | JSX.Element[] | string {
        return <a href="#">{cell.props.isExpandedItem ? '-' : '+'}</a>;
    }
}