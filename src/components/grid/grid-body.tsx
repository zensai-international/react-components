import * as React from 'react';
import { GridMessages } from './grid-base';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { GridRowStyle } from './grid-row';
import { GridBodyRow, GridBodyRowProps } from './grid-body-row';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';
import { GridExpandContentColumn } from "./grid-column";
import { EventsStore } from "../../infrastructure/event-store";


export interface GridBodyStyle extends Style {
    dataRow: GridRowStyle;
    detailsRow: GridRowStyle;
    loadingRow: GridRowStyle;
    messageRow: GridRowStyle;
}

export interface GridBodyProps {
    columns: GridColumn<GridColumnProps>[];
    dataSource: DataSource<any>;
    expandedModels: any[];
    messages: GridMessages;
    style: GridBodyStyle;
    eventsStore: EventsStore;
}

export abstract class GridBody<P extends GridBodyProps, S> extends React.Component<P, S> {

    protected renderLoadingRow(): JSX.Element {
        return this.renderMessageRow(this.props.messages.loading, this.props.style.loadingRow);
    }

    protected abstract renderMessageRow(message: string, style: Style): JSX.Element;

    protected abstract renderDetailsRow(model: any, index: number): JSX.Element;

    protected renderRows(): JSX.Element[] {
        const Row = this.rowType;
        //const DetailsRow = this.detailsRowType;
        const style = this.props.style;
        const renderDataRow = (x: any, i: number) => <Row {...this.props} key={`row-${i}`} index={i} model={x} style={style.dataRow} />;

        const detailsColumn = this.props.columns.find(x => x instanceof GridExpandContentColumn) as GridExpandContentColumn;
        
        //const renderDetailsRow = (x: any, i: number) => <DetailsRow {...this.props} key={`details-row-${i}`} index={i} model={x} style={style.detailsRow} />;

        switch (this.props.dataSource.state) {
            case DataSourceState.Empty:
            case DataSourceState.Binding:
                return [this.renderLoadingRow()];
            case DataSourceState.Bound: {
                const data = this.props.dataSource.view.data;
                return (data.length > 0)
                    ? data.map((x, i) =>
                        (this.props.expandedModels.indexOf(x) != -1)
                            ? [renderDataRow(x, i)].concat(detailsColumn.props.renderDetails(Row, i, x))
                            : [renderDataRow(x, i)]) as any
                    : [this.renderMessageRow(this.props.messages.noItems, style.messageRow)];
            }
        }
    }

    protected abstract get rowType(): { new(): GridBodyRow<GridBodyRowProps, any> };

    
}