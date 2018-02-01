import { GridComponent } from './grid-component';
import { GridBodyCell } from './grid-body-cell';
import { GridCell, GridCellStyle } from './grid-cell';
import { GridHeaderCell, GridHeaderCellStyle } from './grid-header-cell';

export interface GridColumnCellProps {
    cellType?: { new (): GridCell };
    style?: GridCellStyle;
}

export interface GridColumnBodyCellProps extends GridColumnCellProps {
    cellType?: { new (): GridBodyCell };
    template?: (item: any, column: GridColumn, cell: GridBodyCell) => JSX.Element | JSX.Element[] | string;
}

export interface GridColumnHeaderCellProps extends GridColumnCellProps {
    cellType?: { new (): GridHeaderCell };
    style?: GridHeaderCellStyle;
    template?: (column: GridColumn, cell: GridHeaderCell) => JSX.Element | JSX.Element[] | string;
}

export interface GridColumnProps {
    body?: GridColumnBodyCellProps;
    field?: string;
    header?: GridColumnHeaderCellProps;
    isSortable?: boolean;
    title?: string;
}

export class GridColumn<P extends GridColumnProps = GridColumnProps> extends GridComponent<P, any> {
}