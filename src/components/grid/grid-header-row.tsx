import { GridRow, GridRowProps, GridRowStyle } from './grid-row';
import { GridHeaderCellStyle } from './grid-header-cell';

export interface GridHeaderRowProps extends GridRowProps {
    style: GridHeaderRowStyle;
}

export interface GridHeaderRowStyle extends GridRowStyle {
    cell: GridHeaderCellStyle;
}

export abstract class GridHeaderRow<P extends GridHeaderRowProps, S> extends GridRow<P, S> {
}