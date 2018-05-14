import * as React from 'react';
import { DataSource, DataSourceProps } from '../../infrastructure/data/data-source';

export abstract class DataSourceProvider<P extends DataSourceProps> extends React.Component<P> {
    private _dataSource: DataSource;

    public constructor(props: P) {
        super(props);

        this._dataSource = this.createDataSource(props);
    }

    protected createDataSource(props: DataSourceProps): DataSource {
        return new this.dataSourceType(props);
    }

    public render(): JSX.Element {
        const callback = this.props.children as (dataSource: DataSource) => JSX.Element

        return callback(this._dataSource);
    }

    protected get dataSource(): DataSource {
        return this._dataSource;
    }

    protected set dataSource(value: DataSource) {
        this._dataSource = value;
    }

    protected abstract get dataSourceType(): { new (props: DataSourceProps): DataSource }
}