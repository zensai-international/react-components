import * as React from 'react';
import { GridCell, GridCellProps } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridBodyRowProps } from './grid-body-row';
import { Style } from '../common';
import { ObjectHelper } from '../../infrastructure/helpers/object-helper';

export interface GridBodyCellProps extends GridCellProps {
    rowProps: GridBodyRowProps;
}

export abstract class GridBodyCell<P extends GridBodyCellProps = GridBodyCellProps, S = {}> extends GridCell<P, S> {
    protected getAttributes(): React.HTMLAttributes<{}> {
        const content = this.renderContent();
        const className = this.style.className;
        const field = this.props.column ? this.props.column.props.field : '';
        const title = ObjectHelper.isString(content) ? content : '';

        return {
            className: className,
            'data-column-name': field,
            onClick: this.handleClick,
            role: 'gridcell',
            title: title
        } as any;
    }

    protected getStyleByColumn(column: GridColumn): Style {
        return column.props.body ? column.props.body.style : null;
    }

    protected getValue(): any {
        const item = this.props.rowProps.item;
        const field = this.props.column.props.field;

        return (item && field)
            ? this.context.grid.props.dataSource.fieldAccessor.getValue(item, field)
            : null;
    }

    protected renderContent(): React.ReactNode {
        if (this.props.children) {
            return this.props.children;
        }

        const column = this.props.column;
        const item = this.props.rowProps.item;
        const value = this.getValue();
        const template = column.props.body ? column.props.body.template : null;

        return template ? template(item, column, this) : value;
    }
}