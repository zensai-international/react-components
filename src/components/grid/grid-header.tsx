import * as React from 'react';
import { Style } from '../common';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { GridHeaderRow, GridHeaderRowProps, GridHeaderRowStyle } from './grid-header-row';

export interface GridHeaderProps {
    columns: GridColumn<GridColumnProps>[];
    style: GridHeaderStyle;

    onCellClick: (event: React.MouseEvent<any>, sender: any) => void;
    onRowClick: (event: React.MouseEvent<any>, sender: any) => void;
}

export interface GridHeaderStyle extends Style {
    row: GridHeaderRowStyle;
}

export abstract class GridHeader<P extends GridHeaderProps = GridHeaderProps, S = any> extends GridComponent<P, S> {
    protected getAttributes(): React.HTMLAttributes<{}> {
        const className = this.props.style.className;

        return {
            className,
            role: 'rowheader',
        };
    }

    protected renderRows(): React.ReactNode {
        const Row = this.rowType;
        const rowStyle = this.props.style.row;

        return [<Row {...this.props} index={0} key={0} style={rowStyle} />];
    }

    protected abstract get rowType(): { new (props: GridHeaderRowProps): GridHeaderRow };
}