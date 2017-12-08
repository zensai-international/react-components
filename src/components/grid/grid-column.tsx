import { GridComponent } from './grid-component';
import { GridCell } from './grid-cell';
import { Style } from '../common';

export interface GridCellOverwriteProps {
    cellType?: { new (): GridCell };
    style?: Style;
    template?: (item: any, column: GridColumn, cell: GridCell) => JSX.Element | JSX.Element[] | string;
}

export interface GridColumnProps {
    body?: GridCellOverwriteProps;
    field?: string;
    footer?: GridCellOverwriteProps;
    header?: GridCellOverwriteProps;
    isSortable?: boolean;
    title?: string;
}

export class GridColumn<P extends GridColumnProps = GridColumnProps> extends GridComponent<P, any> {
}