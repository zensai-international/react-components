import * as React from 'react';
import { Style } from '../common';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { GridFooterRow, GridFooterRowProps } from './grid-footer-row';
import { GridRowStyle } from './grid-row';

export interface GridFooterProps {
    columns: GridColumn<GridColumnProps>[];
    style: GridFooterStyle;

    onCellClick: (event: React.MouseEvent<any>, sender: any) => void;
    onRowClick: (event: React.MouseEvent<any>, sender: any) => void;
}

export interface GridFooterStyle extends Style {
    row: GridRowStyle;
}

export abstract class GridFooter<P extends GridFooterProps = GridFooterProps, S = any> extends GridComponent<P, S> {
    protected getAttributes(): React.HTMLAttributes<{}> {
        const className = this.props.style.className;

        return {
            className,
            role: 'rowfooter',
        };
    }

    protected renderRows(): React.ReactNode {
        const Row = this.rowType;
        const rowStyle = this.props.style.row;

        return <Row {...this.props} key="footer" style={rowStyle} />;
    }

    protected abstract get rowType(): { new (props: GridFooterRowProps): GridFooterRow };
}