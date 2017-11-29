import * as React from 'react';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { GridHeaderRow, GridHeaderRowProps, GridHeaderRowStyle } from './grid-header-row';
import { Style } from '../common';
import { DataSource } from '../../infrastructure/data/data-source';
import { EventsStore } from "../../infrastructure/event-store";

export interface GridHeaderProps {
    columns: GridColumn<GridColumnProps>[];
    dataSource: DataSource<any>;
    style: GridHeaderStyle;
    eventsStore: EventsStore;
}

export interface GridHeaderStyle extends Style {
    row: GridHeaderRowStyle;
}

export abstract class GridHeader<P extends GridHeaderProps, S> extends React.Component<P, S> {
    protected renderRows(): JSX.Element[] {
        const Row = this.rowType;
        const rowStyle = this.props.style.row;

        return [<Row {...this.props} index={0} key={0} style={rowStyle} />];
    }

    protected abstract get rowType(): { new(): GridHeaderRow<GridHeaderRowProps, any> };
}