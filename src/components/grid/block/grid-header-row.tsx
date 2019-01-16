import * as React from 'react';
import { GridHeaderRow as GridHeaderRowBase, GridHeaderRowProps } from '../grid-header-row';
import { GridHeaderCell, GridHeaderCellProps } from './grid-header-cell';

export class GridHeaderRow<P extends GridHeaderRowProps = GridHeaderRowProps, S = {}> extends GridHeaderRowBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <div {...attributes}>
                {this.renderCells()}
            </div>
        );
    }

    protected get cellType(): { new (props: GridHeaderCellProps): GridHeaderCell } {
        return GridHeaderCell;
    }
}

export * from '../grid-header-row';