import * as React from 'react';
import { GridFooterCell, GridFooterCellProps } from './grid-footer-cell';
import { GridFooterRow as GridFooterRowBase, GridFooterRowProps } from '../grid-footer-row';

export class GridFooterRow<P extends GridFooterRowProps = GridFooterRowProps, S = {}> extends GridFooterRowBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <tr {...attributes}>
                {this.renderCells()}
            </tr>
        );
    }

    protected get cellType(): { new (props: GridFooterCellProps): GridFooterCell } {
        return GridFooterCell;
    }
}

export * from '../grid-footer-row';