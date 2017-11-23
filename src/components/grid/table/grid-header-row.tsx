import * as React from 'react';
import { GridHeaderCell } from './grid-header-cell';
import { GridHeaderRow as GridHeaderRowBase, GridHeaderRowProps } from '../grid-header-row';

export class GridHeaderRow extends GridHeaderRowBase<GridHeaderRowProps, any> {
    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <tr className={className} key={this.props.index}>
                {this.renderCells()}
            </tr>
        );
    }

    protected get cellType(): { new (): GridHeaderCell } {
        return GridHeaderCell;
    }
}