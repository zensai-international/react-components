import * as React from 'react';
import { GridHeaderCell as GridHeaderCellBase, GridHeaderCellProps, GridHeaderCellState } from '../grid-header-cell';

export class GridHeaderCell<P extends GridHeaderCellProps = GridHeaderCellProps, S = GridHeaderCellState>  extends GridHeaderCellBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <th {...attributes}>
                {this.renderContent()}
            </th>
        );
    }
}

export * from '../grid-header-cell';