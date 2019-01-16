import * as React from 'react';
import { GridBody as GridBodyBase, GridBodyProps } from '../grid-body';
import { GridBodyRow, GridBodyRowProps } from './grid-body-row';

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