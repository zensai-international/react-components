import { GridCell, GridCellProps } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridRow, GridRowProps } from './grid-row';

export interface GridFooterRowProps extends GridRowProps {
}

export abstract class GridFooterRow<P extends GridFooterRowProps = GridFooterRowProps, S = any> extends GridRow<P, S> {
    protected getAttributes(): React.HTMLAttributes<{}> {
        const className = this.props.style.className;
        const key = this.props.index;

        return {
            className: className,
            key: key,
            onClick: this.handleClick,
            role: 'rowfooter'
        } as any;
    }

    protected getCellTypeByColumn(column: GridColumn): { new (props: GridCellProps): GridCell } {
        return column.props.footer ? column.props.footer.cellType : null;
    }
}