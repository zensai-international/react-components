import * as React from 'react';
import { GridHeaderCell as GridHeaderCellBase, GridHeaderCellProps } from '../grid-header-cell';

export class GridHeaderCell extends GridHeaderCellBase<GridHeaderCellProps, any> {
    public render(): JSX.Element {
        const columnProps = this.props.column.props;
        const className = this.props.style.className;

        return (
            <th className={className} onClick={this.handleSortClicked}>
                {columnProps.title}
            </th>
        );
    }
}