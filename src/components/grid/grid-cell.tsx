import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { Style } from '../common';

export interface GridCellProps {
    column: GridColumn<GridColumnProps>;
    columnIndex: number;
    rowIndex: number;
    style: Style;

    onClicked: (sender: any) => void;
}

export interface GridCellStyle extends Style {
}

export class GridCell<P extends GridCellProps = GridCellProps, S = any> extends GridComponent<P, S> {
    public constructor(props: P) {
        super(props);

        this.handleClicked = this.handleClicked.bind(this);
    }

    protected handleClicked() {
        if (this.props.onClicked) {
            this.props.onClicked(this);
        }
    }
}