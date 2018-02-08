import * as React from 'react';
import { GridCell, GridCellProps, GridCellStyle } from './grid-cell';
import { GridColumn } from './grid-column';
import { Style } from '../common';
import { SortDirection } from '../../infrastructure/data/common';
import { DataSource } from '../../infrastructure/data/data-source';
import { ConditionalExpression, ComparisonOperator } from '../../infrastructure/expressions/expression';

export interface GridHeaderCellProps extends GridCellProps {
    dataSource: DataSource<any>;
    style: GridHeaderCellStyle;
    title?: GridHeaderCellStyle;
}

export interface GridHeaderCellStyle extends GridCellStyle {
    filterIcon?: (isFiltered: boolean) => Style;
    iconBySortDirection?: { [direction: number]: Style };
    title?: Style;
}

export interface GridHeaderCellState {
    showFilter?: boolean;
}

export abstract class GridHeaderCell<P extends GridHeaderCellProps = GridHeaderCellProps, S extends GridHeaderCellState = GridHeaderCellState> extends GridCell<P, S> {
    public constructor(props?: P) {
        super(props);

        this.state = { showFilter: false } as any;

        this.handleClickToShowOrHideFilter = this.handleClickToShowOrHideFilter.bind(this);
        this.handleClickToSort = this.handleClickToSort.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
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

    protected getStyleByColumn(column: GridColumn): Style {
        return column.props.header ? column.props.header.style : null;
    }

    protected handleClickToShowOrHideFilter(event: React.MouseEvent<any>) {
        this.setState({ showFilter: !this.state.showFilter });
    }

    protected handleClickToSort(event: React.MouseEvent<any>) {
        const props = this.props.column.props;

        if ((props.isSortable != false) && props.field) {
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
    }

    protected handleFilter(value: string) {
        const filterContext = this.context.grid.filterContext;
        const field = this.props.column.props.field;

        if (value) {
            filterContext.add(field, { field: field, operator: ComparisonOperator.Contain, value: value });
        } else {
            filterContext.delete([field]);
        }
    }

    protected renderContent(): JSX.Element | JSX.Element[] | string {
        const column = this.props.column;
        const columnProps = column.props;
        const isSortable = (columnProps.isSortable != false);
        const sortDirection = isSortable ? this.getSortDirection() : null;
        const sortIconClassName = sortDirection ? this.props.style.iconBySortDirection[sortDirection].className : null;
        const titleClassName = (this.style as GridHeaderCellStyle).title.className;
        const template = column.props.header ? column.props.header.template : null;
        const filterContext = this.context.grid.filterContext;
        const filterExpression = filterContext.get(column.props.field);

        return template
            ? template(column, this)
            : (
                <span className={titleClassName}>
                    <span onClick={this.handleClickToSort}>{columnProps.title}</span>
                    {(isSortable && sortDirection) ? <i className={sortIconClassName} /> : null}
                    {this.state.showFilter ? this.renderFilter(filterExpression) : null}
                    {this.renderFilterIcon()}
                </span>
            );
    }

    protected renderFilter(expression: ConditionalExpression): JSX.Element {
        return null;
    }

    protected renderFilterIcon(): JSX.Element {
        const column = this.props.column;
        const columnProps = column.props;
        const isFilterable = (columnProps.isFilterable != false);
        const filterContext = this.context.grid.filterContext;
        const filterExpression = filterContext.get(column.props.field);
        const filterIconClassName = this.props.style.filterIcon(filterExpression != null).className;

        return isFilterable
            ? <i className={filterIconClassName} onClick={this.handleClickToShowOrHideFilter} />
            : null;
    }
}