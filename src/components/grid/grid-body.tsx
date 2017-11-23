import * as React from 'react';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { GridRowStyle } from './grid-row';
import { GridBodyRow, GridBodyRowProps, GridBodyRowType } from './grid-body-row';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';

export interface GridBodyStyle extends Style {
    dataRow: GridRowStyle;
    detailsRow: GridRowStyle;
    emptyRow: GridRowStyle;
    loadingRow: GridRowStyle;
}

export interface GridBodyProps {
    columns: GridColumn<GridColumnProps>[];
    dataSource: DataSource<any>;
    expandedModels: any[];
    style: GridBodyStyle;
}

export abstract class GridBody<P extends GridBodyProps, S> extends React.Component<P, S> {
    protected renderRows(): JSX.Element[] {
        const Row = this.rowType;
        const style = this.props.style;
        const renderDataRow = (x: any, i: number) => <Row {...this.props} index={i} model={x} style={style.dataRow} type={GridBodyRowType.Data} />;

        switch (this.props.dataSource.state) {
            case DataSourceState.Empty:
            case DataSourceState.Binding:
                return [<Row {...this.props} style={style.loadingRow} index={0} type={GridBodyRowType.Loading} />];
            case DataSourceState.Bound: {
                const data = this.props.dataSource.view.data;

                return (data.length > 0)
                    ? data.map((x, i) =>
                        (this.props.expandedModels.indexOf(x) != -1)
                            ? [renderDataRow(x, i), <Row {...this.props} index={i} model={x} style={style.detailsRow} type={GridBodyRowType.Details} />]
                            : [renderDataRow(x, i)]) as any
                    : [<Row {...this.props} index={0} style={style.emptyRow} type={GridBodyRowType.Empty} />];
            }
        }
    }

    protected abstract get rowType(): { new(): GridBodyRow<GridBodyRowProps, any> };
}