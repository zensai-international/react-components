import { Event } from '../event';

export enum DataSourceChangeType {
    Create,
    Update,
    Delete
}

export interface DataSourceChange<T = {}> {
    item: T;
    type: DataSourceChangeType;
}

export interface DataSourceUpdate<T = {}> extends DataSourceChange<T> {
    field: string;
    prevValue: any;
    value: any;
}

export interface DataSourceChangeTracker<T = {}> {
    apply();
    rollback();

    readonly changes: DataSourceChange<T>[];

    readonly onChange: Event<DataSourceChange>;
}