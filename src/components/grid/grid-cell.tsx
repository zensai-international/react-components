import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { Style, StyleHelper } from '../common';

export interface GridCellProps {
    column: GridColumn<GridColumnProps>;
    columnIndex: number;
    rowIndex: number;
    style: Style;

    onClick: (event: React.MouseEvent<any>, sender: any) => void;
}

export interface GridCellStyle extends Style {
}

export abstract class GridCell<P extends GridCellProps = GridCellProps, S = any> extends GridComponent<P, S> {
    public constructor(props: P) {
        super(props);

        this.handleClicked = this.handleClicked.bind(this);
    }

    protected abstract getStyleByColumn(column: GridColumn): Style;

    protected handleClicked(event: React.MouseEvent<any>) {
        if (this.props.onClick) {
            this.props.onClick(event, this);
        }
    }

    protected get style(): Style {
        const column = this.props.column;
        const styleByColumn = column ? this.getStyleByColumn(column) : null;

        return styleByColumn
            ? StyleHelper.concat(this.props.style, styleByColumn)
            : this.props.style;
    }
}