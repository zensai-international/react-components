import { GridBodyCell } from './grid-body-cell';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridHeaderCell } from './grid-header-cell';

export class GridEmptyColumn<P extends GridColumnProps = GridColumnProps> extends GridColumn<P> {
    public static defaultProps: Partial<GridColumnProps> = {
        body: {
            template: (item: any, column: GridColumn<GridColumnProps>, cell: GridBodyCell) => '',
        },
        header: {
            template: (column: GridColumn<GridColumnProps>, cell: GridHeaderCell) => '',
        },
        isSortable: false,
        title: '',
    };
}