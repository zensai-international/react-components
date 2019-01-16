import * as React from 'react';
import { GridBodyRow as GridBodyRowBase, GridBodyRowProps } from '../grid-body-row';
import { GridBodyCell } from './grid-body-cell';

export class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = {}> extends GridBodyRowBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <tr {...attributes}>
                {this.renderContent()}
            </tr>
        );
    }

    protected get cellType(): { new (props): GridBodyCell } {
        return GridBodyCell;
    }
}

export * from '../grid-body-row';
