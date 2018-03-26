import * as React from 'react';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';
import { GridBodyRow, GridBodyRowStyle, GridBodyRowTemplate } from './grid-body-row';
import { Style } from '../common';
import { DataViewMode, DataSourceState } from '../../infrastructure/data/data-source';
import { ObjectHelper } from '../../infrastructure/helpers/object-helper';

export interface GridBodyStyle extends Style {
    row: GridBodyRowStyle;
}

export interface GridBodyProps {
    columns: GridColumn<GridColumnProps>[];
    style: GridBodyStyle;
    rowTemplate: GridBodyRowTemplate;

    onCellClick: (event: React.MouseEvent<any>, sender: any) => void;
    onRowClick: (event: React.MouseEvent<any>, sender: any) => void;
}

export abstract class GridBody<P extends GridBodyProps = GridBodyProps, S = {}> extends GridComponent<P, S> {
    protected renderDataRow(item: any, index: number): JSX.Element | JSX.Element[] {
        const Row = this.rowType;
        const style = this.props.style;
        const grid = this.context.grid;
        const isExpanded = grid.expander.isExpanded(item);
        const isSelected = grid.selector.isSelected(item);
        const rowProps = Object.assign({}, this.props, {
            children: null,
            key: `row-${index}`,
            index: index,
            isExpandable: null,
            isExpanded: isExpanded,
            isSelected: isSelected,
            item: item,
            style: style.row
        });

        return this.props.rowTemplate
            ? this.props.rowTemplate(Row, rowProps, this.context)
            : <Row {...rowProps} />;
    }

    protected renderEmptyRow(): JSX.Element {
        return this.renderRow(this.context.grid.messages.noItems);
    }

    protected renderSpinnerRow(): JSX.Element {
        const Spinner = this.context.spinnerType;

        return this.renderRow(<Spinner />);
    }

    protected renderRow(content: JSX.Element | string): JSX.Element {
        const Row = this.rowType;
        const style = this.props.style;

        return (
            <Row {...this.props}
                index={null}
                isExpandable={null}
                isExpanded={null}
                isSelected={null}
                item={null}
                key="row-message"
                style={style.row}>
                {ObjectHelper.isString(content) ? <span>{content}</span> : content}
            </Row>
        );
    }

    protected renderRows(): JSX.Element[] {
        const dataSource = this.context.grid.props.dataSource;
        const data = dataSource.view ? dataSource.view.data : [];
        const renderRows = () => data.map((x, i) => this.renderDataRow(x, i)) as JSX.Element[];

        switch (dataSource.state) {
            case DataSourceState.Empty:
                return [this.renderSpinnerRow()];
            case DataSourceState.Binding:
                return (dataSource.view && (dataSource.view.mode == DataViewMode.FromFirstToCurrentPage))
                    ? renderRows().concat([this.renderSpinnerRow()])
                    : [this.renderSpinnerRow()];
            case DataSourceState.Bound: {
                const data = dataSource.view.data;

                return (data.length > 0)
                    ? renderRows()
                    : [this.renderEmptyRow()];
            }
        }
    }

    protected abstract get rowType(): { new(): GridBodyRow };
}