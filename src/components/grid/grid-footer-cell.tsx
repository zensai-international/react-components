import * as React from 'react';
import { Style } from '../common';
import { GridCell, GridCellProps } from './grid-cell';
import { GridColumn } from './grid-column';

export interface GridFooterCellProps extends GridCellProps {
}

export interface GridHeaderCellState {
    showFilter?: boolean;
}

export abstract class GridFooterCell<P extends GridFooterCellProps = GridFooterCellProps, S = S> extends GridCell<P, S> {
    protected getAttributes(): React.HTMLAttributes<{}> {
        const field = this.props.column.props.field;
        const className = this.style.className;

        return {
            className,
            'data-column-name': field,
            onClick: this.handleClick,
            role: 'columnfooter',
        } as any;
    }

    protected getStyleByColumn(column: GridColumn): Style {
        return column.props.footer ? column.props.footer.style : null;
    }

    protected renderContent(): React.ReactNode {
        const { column } = this.props;
        const { props: columnProps } = column;
        const template = columnProps.footer ? columnProps.footer.template : null;

        return template
            ? template(column, this)
            : null;
    }
}