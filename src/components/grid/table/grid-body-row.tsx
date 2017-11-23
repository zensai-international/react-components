import * as React from 'react';
import { GridBodyCell } from './grid-body-cell';
import { GridBodyRow as GridBodyRowBase, GridBodyRowProps } from '../grid-body-row';

export class GridBodyRow extends GridBodyRowBase<GridBodyRowProps, any> {
    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <tr className={className}>
                {this.renderCells()}
            </tr>
        );
    }

    protected get cellType(): { new (): GridBodyCell } {
        return GridBodyCell;
    }
}