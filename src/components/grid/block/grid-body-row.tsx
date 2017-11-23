import * as React from 'react';
import { GridBodyCell } from './grid-body-cell';
import { GridBodyRow as GridBodyRowBase, GridBodyRowProps } from '../grid-body-row';

export class GridBodyRow extends GridBodyRowBase<GridBodyRowProps, any> {
    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <div className={className}>
                {this.renderCells()}
            </div>
        );
    }

    protected get cellType(): { new (): GridBodyCell } {
        return GridBodyCell;
    }
}