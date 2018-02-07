import * as React from 'react';
import { GridBodyCell as GridBodyCellBase, GridBodyCellProps } from '../grid-body-cell';

export class GridBodyCell<P extends GridBodyCellProps = GridBodyCellProps, S = any> extends GridBodyCellBase<P, S> {
    public render(): JSX.Element {
        const className = this.style.className;

        return (
            <div className={className} onClick={this.handleClick}>
                {this.renderContent()}
            </div>
        );
    }
}