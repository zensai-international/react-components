import * as React from 'react';
import { GridBodyCell } from './grid-body-cell';
import { GridBodyRow as GridBodyRowBase, GridBodyRowProps } from '../grid-body-row';

export class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = {}> extends GridBodyRowBase<P, S> {
    public render(): JSX.Element {
        const className = this.style.className;

        return (
            <tr className={className} onClick={this.handleClick}>
                {this.renderContent()}
            </tr>
        );
    }

    protected get cellType(): { new (props): GridBodyCell } {
        return GridBodyCell;
    }
}

export * from '../grid-body-row';
