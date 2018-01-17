import * as React from 'react';
import { GridCell, GridCellProps, GridCellStyle } from './grid-cell';
import { GridColumn } from './grid-column';
import { Style } from '../common';
import { SortDirection } from '../../infrastructure/data/common';
import { DataSource } from '../../infrastructure/data/data-source';

export interface GridHeaderCellProps extends GridCellProps {
    dataSource: DataSource<any>;
    style: GridHeaderCellStyle;
    title?: GridHeaderCellStyle;
}

export interface GridHeaderCellStyle extends GridCellStyle {
    iconBySortDirection?: { [direction: number]: Style };
    title?: Style;
}

export abstract class GridHeaderCell<P extends GridHeaderCellProps = GridHeaderCellProps, S = any> extends GridCell<P, S> {
    public constructor(props?: P) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    protected getStyleByColumn(column: GridColumn): Style {
        return column.props.header ? column.props.header.style : null;
    }

    protected handleClick() {
        const field = this.props.column.props.field;

        if (!field) return;

        const dataSource = this.props.dataSource;
        let sortedBy = null;

        if (dataSource.view && dataSource.view.sortedBy) {
            sortedBy = dataSource.view.sortedBy.filter(x => x.field == field);
            sortedBy = (sortedBy.length == 1) ? sortedBy[0] : null;
        }

        const direction = (sortedBy != null)
            ? ((sortedBy.direction == SortDirection.Ascending) ? SortDirection.Descending : null)
            : SortDirection.Ascending;

        if (direction) {
            dataSource.sort([{ direction: direction, field: field }]);
        } else {
            dataSource.sort([]);
        }

        dataSource.dataBind();
    }

    protected getSortDirection(): SortDirection {
        const field = this.props.column.props.field;
        const dataSource = this.props.dataSource;
        const sortedBy = (this.props.dataSource.view && dataSource.view.sortedBy)
            ? dataSource.view.sortedBy.filter(x => x.field == field)
            : null;

        return (sortedBy != null)
                && (sortedBy.length == 1)
                && (sortedBy[0].field == field)
            ? sortedBy[0].direction
            : null;
    }

    protected renderTitle(): JSX.Element {
        const columnProps = this.props.column.props;
        const isSortable = (columnProps.isSortable != false);
        const sortDirection = isSortable ? this.getSortDirection() : null;
        const iconClassName = sortDirection ? this.props.style.iconBySortDirection[sortDirection].className : null;
        const titleClassName = (this.style as GridHeaderCellStyle).title.className;

        return isSortable && sortDirection
            ? (
                <span className={titleClassName} onClick={this.handleClick}>
                    <span>{columnProps.title}</span>
                    <i className={iconClassName} />
                </span>
            )
            : (
                <span className={titleClassName} onClick={isSortable ? this.handleClick : null}>
                    {columnProps.title}
                </span>
            );
    }
}