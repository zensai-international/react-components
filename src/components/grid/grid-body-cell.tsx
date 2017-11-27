import { GridCell, GridCellProps } from './grid-cell';

export interface GridBodyCellProps extends GridCellProps {
    model?: any;
}

export class GridBodyCell<P extends GridBodyCellProps, S> extends GridCell<P, S> {
    protected getValue(): any {
        const model = this.props.model;
        const field = this.props.column.props.field;

        return (model && field)
            ? this.props.dataSource.fieldAccessor.getValue(model, field)
            : null;
    }
}