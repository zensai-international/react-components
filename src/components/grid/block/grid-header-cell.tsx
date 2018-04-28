import * as React from 'react';
import { GridHeaderCell as GridHeaderCellBase, GridHeaderCellProps, GridHeaderCellState } from '../grid-header-cell';

export class GridHeaderCell<P extends GridHeaderCellProps = GridHeaderCellProps, S = GridHeaderCellState>  extends GridHeaderCellBase<P, S> {
    public render(): JSX.Element {
        const className = this.style.className;

        return (
            <div className={className} onClick={this.handleClick}>
                {this.renderContent()}
            </div>
        );
    }
}

export * from '../grid-header-cell';