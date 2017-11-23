import * as React from 'react';
import { GridBodyCell as GridBodyCellBase, GridBodyCellProps } from '../grid-body-cell';

export class GridBodyCell extends GridBodyCellBase<GridBodyCellProps, any> {
    public render(): JSX.Element {
        const className = this.props.style.className;
        const value = this.getValue();

        return (
            <div className={className}>
                {value}
            </div>
        );
    }
}