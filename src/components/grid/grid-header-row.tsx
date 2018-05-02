import { GridCell, GridCellProps } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridRow, GridRowProps, GridRowStyle } from './grid-row';
import { GridHeaderCellStyle } from './grid-header-cell';

export interface GridHeaderRowProps extends GridRowProps {
    style: GridHeaderRowStyle;
}

export interface GridHeaderRowStyle extends GridRowStyle {
    cell: GridHeaderCellStyle;
}

export abstract class GridHeaderRow<P extends GridHeaderRowProps = GridHeaderRowProps, S = any> extends GridRow<P, S> {
    protected getAttributes(): React.HTMLAttributes<{}> {
        const className = this.props.style.className;
        const key = this.props.index;

        return {
            className: className,
            key: key,
            onClick: this.handleClick,
            role: 'rowheader'
        } as any;
    }

    protected getCellTypeByColumn(column: GridColumn): { new (props: GridCellProps): GridCell } {
        return column.props.header ? column.props.header.cellType : null;
    }
}