import { GridRow, GridRowProps, GridRowStyle } from './grid-row';

export interface GridHeaderRowProps extends GridRowProps {
    style: GridHeaderRowStyle;
}

export interface GridHeaderRowStyle extends GridRowStyle {
    styleBySortDirection?: { [direction: number]: string };
}

export abstract class GridHeaderRow<P extends GridHeaderRowProps, S> extends GridRow<P, S> {
}