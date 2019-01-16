import * as React from 'react';
import { DataSourceState, DataViewMode } from '../../infrastructure/data/data-source';
import { ObjectHelper } from '../../infrastructure/helpers/object-helper';
import { Style } from '../common';
import { GridBodyRow, GridBodyRowProps, GridBodyRowStyle, GridBodyRowTemplate } from './grid-body-row';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridComponent } from './grid-component';

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
    protected getAttributes(): React.HTMLAttributes<{}> {
        const className = this.props.style.className;

        return {
            className,
            role: 'rowgroup',
        };
    }

    protected renderDataRow(item: any, index: number): React.ReactNode {
        const Row = this.rowType;
        const style = this.props.style;
        const grid = this.context.grid;
        const isExpanded = grid.expander.isExpanded(item);
        const isSelected = grid.selector.isSelected(item);
        const rowProps = Object.assign({}, this.props, {
            children: null,
            key: `row-${index}`,
            index,
            isExpandable: null,
            isExpanded,
            isSelected,
            item,
            style: style.row,
        });

        return this.props.rowTemplate
            ? this.props.rowTemplate(Row, rowProps, this.context)
            : <Row {...rowProps} />;
    }

    protected renderEmptyRow(): React.ReactNode {
        return this.renderRow(this.context.grid.messages.noItems);
    }

    protected renderSpinnerRow(): React.ReactNode {
        const Spinner = this.context.spinnerType;

        return this.renderRow(<Spinner />);
    }

    protected renderRow(content: React.ReactNode): React.ReactNode {
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

    protected renderRows(): React.ReactNode {
        const dataSource = this.context.grid.props.dataSource;
        const data = dataSource.view ? dataSource.view.data : [];
        const renderRows = () => data.map((x, i) => this.renderDataRow(x, i)) as React.ReactNode[];

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

    protected abstract get rowType(): { new (props: GridBodyRowProps): GridBodyRow };
}