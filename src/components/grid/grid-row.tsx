import * as React from 'react';
import { GridCell, GridCellProps, GridCellStyle } from './grid-cell';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { Style } from '../common';
import { DataSource } from '../../../src/infrastructure/data/data-source';

export interface GridRowProps {
    columns: GridColumn<GridColumnProps>[];
    dataSource: DataSource<any>;
    index: number;
    style: GridRowStyle;
}

export interface GridRowStyle extends Style {
    cell: GridCellStyle;
}

export abstract class GridRow<P extends GridRowProps, S> extends React.Component<P, S> {
    protected renderCell(column: GridColumn<GridColumnProps>, index: number): JSX.Element {
        const Cell = this.cellType;
        const key = `${this.props.index}_${index}`;
        const style = this.props.style.cell;

        return <Cell {...this.props} column={column} columnIndex={index} key={key} rowIndex={this.props.index} style={style} />;
    }

    protected renderCells(): JSX.Element[] {
        return this.props.columns.map((x, i) => this.renderCell(x, i));
    }

    protected abstract get cellType(): { new(): GridCell<GridCellProps, any> }
}