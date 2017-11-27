import * as React from 'react';
import { GridBodyCell as GridBodyCellBase, GridBodyCellProps } from '../grid-body-cell';

export class GridBodyCell extends GridBodyCellBase<GridBodyCellProps, any> {
    public render(): JSX.Element {
        const className = this.props.style.className;
        const column = this.props.column;
        const model = this.props.model;
        const value = this.getValue();
        const template = column.props.body ? column.props.body.template : null;

        return (
            <div className={className}>
                {template ? template(column, model) : value}
            </div>
        );
    }
}