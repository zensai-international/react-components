import { GridRow, GridRowProps } from './grid-row';

export enum GridBodyRowType {
    Data,
    Details,
    Empty,
    Loading
}

export interface GridBodyRowProps extends GridRowProps {
    model?: any;
    type: GridBodyRowType;
}

export abstract class GridBodyRow<P extends GridBodyRowProps, S> extends GridRow<P, S> {
}