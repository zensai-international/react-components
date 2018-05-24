import * as React from 'react';
import { GridBodyCell as GridBodyCellBase, GridBodyCellProps } from '../grid-body-cell';

export class GridBodyCell<P extends GridBodyCellProps = GridBodyCellProps, S = {}> extends GridBodyCellBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <td {...attributes}>
                {this.renderContent()}
            </td>
        );
    }
}