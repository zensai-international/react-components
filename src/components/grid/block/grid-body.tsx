import * as React from 'react';
import { GridBodyRow } from './grid-body-row';
import { GridBody as GridBodyBase, GridBodyProps } from '../grid-body';

export class GridBody<P extends GridBodyProps = GridBodyProps, S = {}> extends GridBodyBase<P, S> {
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