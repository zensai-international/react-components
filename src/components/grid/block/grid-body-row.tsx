import * as React from 'react';
import { GridBodyCell } from './grid-body-cell';
import { GridBodyRow as GridBodyRowBase, GridBodyRowProps } from '../grid-body-row';

export class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = {}> extends GridBodyRowBase<P, S> {
    public render(): JSX.Element {
        const className = this.style.className;

        return (
            <div className={className} onClick={this.handleClick}>
                {this.renderContent()}
            </div>
        );
    }

    protected get cellType(): { new (): GridBodyCell } {
        return GridBodyCell;
    }
}