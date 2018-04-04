import * as React from 'react';
import { GridCell, GridCellProps, GridCellStyle } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridComponent } from './grid-component';
import { Style } from '../common';

export interface GridRowProps {
    columns: GridColumn[] | JSX.Element[];
    index: number;
    style: GridRowStyle;

    onCellClick: (event: React.MouseEvent<any>, sender: any) => void;
    onRowClick: (event: React.MouseEvent<any>, sender: any) => void;
}

export interface GridRowStyle extends Style {
    cell: GridCellStyle;
}

export abstract class GridRow<P extends GridRowProps = GridRowProps, S = any> extends GridComponent<P, S> {
    protected abstract getCellTypeByColumn(column: GridColumn): { new(): GridCell<GridCellProps, {}> };

    protected handleClick = (event: React.MouseEvent<any>) => {
        if (this.props.onRowClick) {
            this.props.onRowClick(event, this);
        }
    }

    protected renderCell(column: GridColumn, index: number): React.ReactNode {
        const Cell = this.getCellTypeByColumn(column) || this.cellType;
        const key = `${this.props.index}_${index}`;
        const style = this.props.style.cell;

        return (
            <Cell
                column={column}
                columnIndex={index}
                key={key}
                rowProps={this.props}
                onClick={this.props.onCellClick}
                style={style} />
        );
    }

    protected renderCells(): React.ReactNode {
        return (this.props.columns as any[]).map((x, i) => this.renderCell(x, i)); // TODO: Remove any.
    }

    protected renderContent(): React.ReactNode {
        const Cell = this.cellType;
        const style = this.props.style.cell;

        return this.props.children
            ? (
                <Cell
                    column={null}
                    columnIndex={null}
                    key={null}
                    rowProps={this.props}
                    onClick={null}
                    style={style}>
                    {this.props.children}
                </Cell>
            )
            : this.renderCells();
    }

    protected abstract get cellType(): { new(): GridCell }
}