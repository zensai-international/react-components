import { Grid as GridBase, GridProps as GridBaseProps, GridState, GridStyle } from './grid-base';
import { InternalGrid, InternalGridProps } from './internal-grid';
import { Grid as BlockGrid } from './block/grid';
import { Grid as TableGrid } from './table/grid';

const DefaultStyle: GridStyle = {
    className: '',
    body: {
        className: '',
        dataRow: {
            className: '',
            cell: {
                className: ''
            }
        },
        detailsRow: {
            className: '',
            cell: {
                className: ''
            }
        },
        emptyRow: {
            className: '',
            cell: {
                className: ''
            }
        },
        loadingRow: {
            className: '',
            cell: {
                className: ''
            }
        },
    },
    header: {
        row: {
            className: '',
            cell: {
                className: ''
            }
        }
    }
};

export enum GridRenderingMode {
    Block,
    Table
}

export interface GridProps extends GridBaseProps {
    renderingMode?: GridRenderingMode;
}

export class Grid extends GridBase<GridProps, GridState> {
    protected get internalGridType(): { new (): InternalGrid<InternalGridProps> } {
        return (this.props.renderingMode == GridRenderingMode.Block) ? BlockGrid : TableGrid;
    }

    protected get style(): GridStyle {
        return this.props.style ? this.props.style : DefaultStyle;
    }
}