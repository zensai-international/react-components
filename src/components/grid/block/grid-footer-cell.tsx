import * as React from 'react';
import { GridFooterCell as GridFooterCellBase, GridFooterCellProps } from '../grid-footer-cell';

export class GridFooterCell<P extends GridFooterCellProps = GridFooterCellProps, S = S>  extends GridFooterCellBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <div {...attributes}>
                {this.renderContent()}
            </div>
        );
    }
}

export * from '../grid-footer-cell';