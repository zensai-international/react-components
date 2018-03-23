import { GridCell, GridCellProps } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridBodyRowProps } from './grid-body-row';
import { Style } from '../common';

export interface GridBodyCellProps extends GridCellProps {
    rowProps: GridBodyRowProps;
}

export class GridBodyCell<P extends GridBodyCellProps = GridBodyCellProps, S = any> extends GridCell<P, S> {
    protected getStyleByColumn(column: GridColumn): Style {
        return column.props.body ? column.props.body.style : null;
    }

    protected getValue(): any {
        const item = this.props.rowProps.item;
        const field = this.props.column.props.field;

        return (item && field)
            ? this.context.grid.props.dataSource.fieldAccessor.getValue(item, field)
            : null;
    }

    protected renderContent(): JSX.Element | JSX.Element[] | string {
        if (this.props.children) {
            return this.props.children as any;
        }

        const column = this.props.column;
        const item = this.props.rowProps.item;
        const value = this.getValue();
        const template = column.props.body ? column.props.body.template : null;

        return template ? template(item, column, this) : value;
    }
}