import { GridComponent } from './grid-component';
import { GridCell } from './grid-cell';

export interface GridCellOverwriteProps {
    cellType?: { new (): GridCell };
    style?: string;
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