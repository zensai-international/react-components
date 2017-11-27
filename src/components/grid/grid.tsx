import { Grid as GridBase, GridProps as GridBaseProps, GridState, GridStyle } from './grid-base';
import { InternalGrid, InternalGridProps } from './internal-grid';
import { InternalGrid as BlockGrid } from './block/internal-grid';
import { InternalGrid as TableGrid } from './table/internal-grid';

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
        messageRow: {
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
                className: '',
                iconBySortDirection: {
                    [1]: { className: '' },
                    [2]: { className: '' }
                },
                title: {
                    className: ''
                }
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