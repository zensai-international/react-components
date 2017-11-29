import { FilterExpression, SortExpression } from './common';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { FieldAccessor } from './field-accessor';
import { Event } from '../event';

export enum DataViewMode {
    CurrentPage,
    FromFirstToCurrentPage
}

export interface DataView<T> {
    data?: T[];
    filteredBy?: FilterExpression[];
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
    firstPageSize?: number;
    pageSize?: number;
    pageIndex?: number;
    sortedBy?: SortExpression[];
    viewMode?: DataViewMode;
}

export interface DataSource<T> {
    dataBind(): Promise<DataView<T>>;
    filter(...expressions: FilterExpression[]);
    setPageIndex(value: number);
    sort(...expressions: SortExpression[]);
    update(model: T, field: string, value: any);

    readonly changeTracker: DataSourceChangeTracker<T>;
    readonly fieldAccessor: FieldAccessor;
    readonly firstPageSize: number;
    readonly pageSize: number;
    readonly state: DataSourceState;
    readonly view: DataView<T>;

    readonly onDataBinding: Event<any>;
    readonly onDataBound: Event<any>;
}