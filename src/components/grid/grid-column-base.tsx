import * as React from 'react';

export interface GridCellOverwriteProps {
    style?: string;
    template?: (column: GridColumn<any>, model?: any) => JSX.Element | JSX.Element[] | string;
}

export interface GridColumnProps {
    body?: GridCellOverwriteProps;
    field?: string;
    footer?: GridCellOverwriteProps;
    header?: GridCellOverwriteProps;
    isSortable?: boolean;
    title?: string;
}

export class GridColumn<P extends GridColumnProps> extends React.Component<P, any> {
}