import * as React from 'react';
import { GridFooterRow, GridFooterRowProps } from './grid-footer-row';
import { GridFooter as GridFooterBase, GridFooterProps } from '../grid-footer';

export class GridFooter<P extends GridFooterProps = GridFooterProps, S = {}> extends GridFooterBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <tfoot {...attributes}>
                {this.renderRows()}
            </tfoot>
        );
    }

    protected get rowType(): { new (props: GridFooterRowProps): GridFooterRow } {
        return GridFooterRow;
    }
}

export * from '../grid-footer';