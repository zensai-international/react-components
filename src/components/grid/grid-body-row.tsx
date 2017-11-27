import { GridRow, GridRowProps } from './grid-row';

export interface GridBodyRowProps extends GridRowProps {
    model?: any;
}

export abstract class GridBodyRow<P extends GridBodyRowProps, S> extends GridRow<P, S> {
}