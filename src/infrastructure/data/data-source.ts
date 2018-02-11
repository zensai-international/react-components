import { SortExpression } from './common';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { FieldAccessor } from './field-accessor';
import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';

export enum DataViewMode {
    CurrentPage,
    FromFirstToCurrentPage
}

export interface DataViewPage {
    index?: number;
    size?: number;
}

export interface DataView<T = {}> {
    data?: T[];
    filteredBy?: ConditionalExpression;
    mode?: DataViewMode;
    page?: DataViewPage;
    sortedBy?: SortExpression[];
    totalCount?: number;
}

export interface DataViewProps {
    filteredBy?: ConditionalExpression;
    mode?: DataViewMode;
    page?: DataViewPage;
    sortedBy?: SortExpression[];
}

export enum DataSourceOperation {
    Filter,
    GetCount,
    SetPageIndex,
    Sort
}

export enum DataSourceState {
    Empty,
    Binding,
    Bound
}

export interface DataSourceProps {
    fieldAccessor?: FieldAccessor;
    view?: DataViewProps;
}

export interface DataSource<T = {}> {
    dataBind(): Promise<DataView<T>>;
    delete(item: T);
    filter(expression: ConditionalExpression);
    getView(props: DataViewProps): DataView<T>;
    read();
    setPageIndex(value: number);
    sort(expressions: SortExpression[]);
    update(item: T, field: string, value: any);

    readonly changeTracker: DataSourceChangeTracker<T>;
    readonly fieldAccessor: FieldAccessor;
    readonly state: DataSourceState;
    readonly view: DataView<T>;
    readonly viewProps: DataViewProps;

    readonly onDataBinding: Event<DataSource>;
    readonly onDataBound: Event<DataSource>;
}