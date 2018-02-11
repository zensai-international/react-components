import { GridCell } from './grid-cell';
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
    protected getCellTypeByColumn(column: GridColumn): { new(): GridCell } {
        return column.props.header ? column.props.header.cellType : null;
    }
}