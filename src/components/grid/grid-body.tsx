import * as React from 'react';
import { GridMessages } from './grid';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { GridBodyRow, GridBodyRowProps, GridBodyRowStyle, GridBodyRowTemplate } from './grid-body-row';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';

export interface GridBodyStyle extends Style {
    row: GridBodyRowStyle;
}

export interface GridBodyProps {
    columns: GridColumn<GridColumnProps>[];
    dataSource: DataSource;
    messages: GridMessages;
    style: GridBodyStyle;
    rowTemplate: GridBodyRowTemplate;

    onCellClicked: (sender: any) => void;
    onRowClicked: (sender: any) => void;
}

export abstract class GridBody<P extends GridBodyProps, S> extends GridComponent<P, S> {
    protected renderDataRow(item: any, index: number): JSX.Element | JSX.Element[] {
        const Row = this.rowType;
        const style = this.props.style;
        const isExpandedItem = this.context.gridState.expandedItems.indexOf(item) != -1;
        const isSelectedItem = this.context.gridState.selectedItems.indexOf(item) != -1;
        const rowProps = Object.assign({}, this.props, {
            children: null,
            key: `row-${index}`,
            index: index,
            isExpandedItem: isExpandedItem,
            isSelectedItem: isSelectedItem,
            item: item,
            style: style.row
        });

        return this.props.rowTemplate
            ? this.props.rowTemplate(Row, rowProps)
            : <Row {...rowProps} />;
    }

    protected renderLoadingRow(): JSX.Element {
        return this.renderMessageRow(this.props.messages.loading);
    }

    protected renderMessageRow(messageContent: JSX.Element | string): JSX.Element {
        const Row = this.rowType;
        const style = this.props.style;

        return (
            <Row {...this.props}
                index={null}
                isExpandedItem={null}
                isSelectedItem={null}
                item={null}
                style={style.row}>
                {messageContent}
            </Row>
        );
    }

    protected renderRows(): JSX.Element[] {
        switch (this.props.dataSource.state) {
            case DataSourceState.Empty:
            case DataSourceState.Binding:
                return [this.renderLoadingRow()];
            case DataSourceState.Bound: {
                const data = this.props.dataSource.view.data;

                return (data.length > 0)
                    ? data.map((x, i) => this.renderDataRow(x, i)) as JSX.Element[]
                    : [this.renderMessageRow(this.props.messages.noItems)];
            }
        }
    }

    protected abstract get rowType(): { new(): GridBodyRow<GridBodyRowProps, any> };
}