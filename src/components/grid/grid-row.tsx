import * as React from 'react';
import { GridCell, GridCellProps, GridCellStyle } from './grid-cell';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { Style } from '../common';

export interface GridRowProps {
    columns: GridColumn<GridColumnProps>[];
    index: number;
    style: GridRowStyle;

    onCellClick: (sender: any) => void;
    onRowClick: (sender: any) => void;
}

export interface GridRowStyle extends Style {
    cell: GridCellStyle;
}

export abstract class GridRow<P extends GridRowProps = GridRowProps, S = any> extends GridComponent<P, S> {
    public constructor(props: P) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    protected handleClick() {
        if (this.props.onRowClick) {
            this.props.onRowClick(this);
        }
    }

    protected renderCell(column: GridColumn<GridColumnProps>, index: number): JSX.Element {
        const Cell = column.props.body ? column.props.body.cellType || this.cellType : this.cellType;
        const key = `${this.props.index}_${index}`;
        const style = this.props.style.cell;

        return (
            <Cell {...this.props}
                column={column}
                columnIndex={index}
                key={key}
                rowIndex={this.props.index}
                onClick={this.props.onCellClick}
                style={style} />
        );
    }

    protected renderCells(): JSX.Element[] {
        return this.props.columns.map((x, i) => this.renderCell(x, i));
    }

    protected renderContent(): JSX.Element | JSX.Element[] {
        const Cell = this.cellType;
        const style = this.props.style.cell;

        return this.props.children
            ? (
                <Cell {...this.props}
                    column={null}
                    columnIndex={null}
                    key={null}
                    rowIndex={this.props.index}
                    onClick={null}
                    style={style}>
                    {this.props.children}
                </Cell>
            )
            : this.renderCells();
    }

    protected abstract get cellType(): { new(): GridCell<GridCellProps, any> }
}