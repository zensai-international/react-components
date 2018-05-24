import * as React from 'react';
import { GridBodyRow, GridBodyRowProps } from './grid-body-row';
import { GridBody as GridBodyBase, GridBodyProps } from '../grid-body';

export class GridBody<P extends GridBodyProps = GridBodyProps, S = {}> extends GridBodyBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <div {...attributes}>
                {this.renderRows()}
            </div>
        );
    }

    protected get rowType(): { new (props: GridBodyRowProps): GridBodyRow } {
        return GridBodyRow;
    }
}

export * from '../grid-body';