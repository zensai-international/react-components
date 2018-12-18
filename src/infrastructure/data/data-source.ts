import { GroupExpression, SortExpression } from './common';
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
    groupedBy?: GroupExpression;
    mode?: DataViewMode;
    page?: DataViewPage;
    sortedBy?: SortExpression[];
    totalCount?: number;
}

export interface DataViewProps {
    filteredBy?: ConditionalExpression;
    groupedBy?: GroupExpression;
    mode?: DataViewMode;
    page?: DataViewPage;
    sortedBy?: SortExpression[];
}

export enum DataSourceOperation {
    Filter,
    GetCount,
    Group,
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
    getView(props: DataViewProps): Promise<DataView<T>>;
    group(expression: GroupExpression);
    read(): Promise<DataView>;
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