import * as React from 'react';
import { GridBodyRow as GridBodyRowBase, GridBodyRowProps } from '../grid-body-row';
import { GridBodyCell, GridBodyCellProps } from './grid-body-cell';

export class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = {}> extends GridBodyRowBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <div {...attributes}>
                {this.renderContent()}
            </div>
        );
    }

    protected get cellType(): { new (props: GridBodyCellProps): GridBodyCell } {
        return GridBodyCell;
    }
}

export * from '../grid-body-row';