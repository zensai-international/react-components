import * as React from 'react';
import { GridBodyRow } from './grid-body-row';
import { GridBody as GridBodyBase, GridBodyProps } from '../grid-body';

export class GridBody extends GridBodyBase<GridBodyProps, any> {
    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <div className={className}>
                {this.renderRows()}
            </div>
        );
    }

    protected get rowType(): { new (): GridBodyRow } {
        return GridBodyRow;
    }
}