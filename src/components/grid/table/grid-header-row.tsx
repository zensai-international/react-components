import * as React from 'react';
import { GridHeaderCell, GridHeaderCellProps } from './grid-header-cell';
import { GridCell } from '../grid-cell';
import { GridHeaderRow as GridHeaderRowBase, GridHeaderRowProps } from '../grid-header-row';

export class GridHeaderRow<P extends GridHeaderRowProps = GridHeaderRowProps, S = {}> extends GridHeaderRowBase<P, S> {
    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <tr className={className} key={this.props.index}>
                {this.renderCells()}
            </tr>
        );
    }

    protected get cellType(): { new (props: GridHeaderCellProps): GridCell } {
        return GridHeaderCell;
    }
}

export * from '../grid-header-row';