import { SortExpression } from './common';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { FieldAccessor } from './field-accessor';
import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';

export enum DataViewMode {
    CurrentPage,
    FromFirstToCurrentPage
}

export interface DataView<T> {
    data?: T[];
    filteredBy?: ConditionalExpression;
    mode?: DataViewMode;
    pageIndex?: number;
    sortedBy?: SortExpression[];
    totalCount?: number;
}

export enum DataSourceState {
    Empty,
    Binding,
    Bound
}

export interface DataSourceProps {
    fieldAccessor?: FieldAccessor;
    filteredBy?: ConditionalExpression;
    firstPageSize?: number;
    pageSize?: number;
    pageIndex?: number;
    sortedBy?: SortExpression[];
    viewMode?: DataViewMode;
}

export interface DataSource<T = any> {
    dataBind(): Promise<DataView<T>>;
    filter(expression: ConditionalExpression);
    setPageIndex(value: number);
    sort(expressions: SortExpression[]);
    update(item: T, field: string, value: any);

    readonly changeTracker: DataSourceChangeTracker<T>;
    readonly fieldAccessor: FieldAccessor;
    readonly firstPageSize: number;
    readonly pageSize: number;
    readonly state: DataSourceState;
    readonly view: DataView<T>;

    readonly onDataBinding: Event<DataSource>;
    readonly onDataBound: Event<DataSource>;
}