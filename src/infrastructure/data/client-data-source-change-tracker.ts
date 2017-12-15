import { DataSource } from './data-source';
import { DataSourceChange, DataSourceChangeType, DataSourceChangeTracker, DataSourceUpdate } from './data-source-change-tracker';

export class ClientDataSourceChangeTracker<T> implements DataSourceChangeTracker<T> {
    private _changes: DataSourceChange<T>[];
    private _dataSource: DataSource<T>;

    public constructor(dataSource: DataSource<T>) {
        this._changes = [];
        this._dataSource = dataSource;
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
}