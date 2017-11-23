import * as React from 'react';
// import { Grid, GridProps, GridState } from './grid';
// import { SortDirection } from '../../infrastructure/data/common';
// import { DataSource } from '../../infrastructure/data/data-source';

// export interface GridCellProps {
//     style?: string;
//     template?: (column: GridColumn<any>, model?: any) => JSX.Element;
// }

export interface GridColumnProps {
    // body?: GridCellProps;
    field?: string;
    // footer?: GridCellProps;
    // header?: GridCellProps;
    isSortable?: boolean;
    title?: string;
}

export class GridColumn<P extends GridColumnProps> extends React.Component<P, any> {
}