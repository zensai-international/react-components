import { Event } from '../event';
import { DataSource } from './data-source';
import { DataSourceChange, DataSourceChangeTracker, DataSourceChangeType, DataSourceUpdate } from './data-source-change-tracker';

export class ClientDataSourceChangeTracker<T = {}> implements DataSourceChangeTracker<T> {
    private _changes: DataSourceChange<T>[];
    private _dataSource: DataSource<T>;
    private readonly _onChange = new Event<DataSourceChange<T>>();

    public constructor(dataSource: DataSource<T>) {
        this._changes = this.createChanges();
        this._dataSource = dataSource;
    }

    protected createChanges(): DataSourceChange<T>[] {
        return [];
        // TODO: ES11 issue
        // return new Proxy([], {
        //     set: (target: DataSourceChange<T>[], property: PropertyKey, value: any, receiver: any): boolean => {
        //         target[property] = value;

        //         this.onChange.trigger(this, value);

        //         return true;
        //     }
        // });
    }

    public apply() {
        this._changes = [];
    }

    public rollback() {
        const fieldAccessor = this.dataSource.fieldAccessor;

        while (this.changes.length > 0) {
            const change = this.changes.pop();

            switch (change.type) {
                case DataSourceChangeType.Update:
                    const update = change as DataSourceUpdate<T>;

                    fieldAccessor.setValue(update.item, update.field, update.prevValue);
                    break;
            }
        }

        this.dataSource.dataBind();
    }

    protected get dataSource(): DataSource<T> {
        return this._dataSource;
    }

    public get changes(): DataSourceChange<T>[] {
        return this._changes;
    }

    public get onChange(): Event<DataSourceChange<T>> {
        return this._onChange;
    }
}