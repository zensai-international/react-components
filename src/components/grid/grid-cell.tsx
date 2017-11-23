import * as React from 'react';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { Style } from '../common';
import { DataSource } from '../../infrastructure/data/data-source';

export interface GridCellProps {
    column: GridColumn<GridColumnProps>;
    columnIndex: number;
    dataSource: DataSource<any>;
    rowIndex: number;
    style: Style;
}

export interface GridCellStyle extends Style {
}

export class GridCell<P extends GridCellProps, S> extends React.Component<P, S> {
}