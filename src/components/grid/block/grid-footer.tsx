import * as React from 'react';
import { GridFooter as GridFooterBase, GridFooterProps } from '../grid-footer';
import { GridFooterRow, GridFooterRowProps } from './grid-footer-row';

export class GridFooter<P extends GridFooterProps = GridFooterProps, S = {}> extends GridFooterBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <div {...attributes}>
                {this.renderRows()}
            </div>
        );
    }

    protected get rowType(): { new (props: GridFooterRowProps): GridFooterRow } {
        return GridFooterRow;
    }
}

export * from '../grid-footer';