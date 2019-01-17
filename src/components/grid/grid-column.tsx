import { GridBodyCell, GridBodyCellProps } from './grid-body-cell';
import { GridCell, GridCellProps, GridCellStyle } from './grid-cell';
import { GridComponent } from './grid-component';
import { GridFooterCell, GridFooterCellProps } from './grid-footer-cell';
import { GridHeaderCell, GridHeaderCellProps, GridHeaderCellStyle } from './grid-header-cell';

export interface GridColumnCellProps {
    cellType?: { new(props: GridCellProps): GridCell };
    style?: GridCellStyle;
}

export interface GridColumnBodyCellProps extends GridColumnCellProps {
    cellType?: { new(props: GridBodyCellProps): GridBodyCell };
    template?: (item: any, column: GridColumn, cell: GridBodyCell) => React.ReactNode;
}

export interface GridColumnFooterCellProps extends GridColumnCellProps {
    cellType?: { new(props: GridFooterCellProps): GridFooterCell };
    template?: (column: GridColumn, cell: GridFooterCell) => React.ReactNode;
}

export interface GridColumnHeaderCellProps extends GridColumnCellProps {
    cellType?: { new(props: GridHeaderCellProps): GridHeaderCell };
    style?: GridHeaderCellStyle;
    template?: (column: GridColumn, cell: GridHeaderCell) => React.ReactNode;
}

export interface GridColumnProps {
    body?: GridColumnBodyCellProps;
    field?: string;
    filterType?: number;
    footer?: GridColumnFooterCellProps;
    header?: GridColumnHeaderCellProps;
    isFilterable?: boolean;
    isSortable?: boolean;
    title?: string;
}

export class GridColumn<P extends GridColumnProps = GridColumnProps, S = {}> extends GridComponent<P, S> {
    public static defaultProps: Partial<GridColumnProps> = {
        isSortable: true,
    };
}