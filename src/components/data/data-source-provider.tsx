import * as React from 'react';
import { DataSource, DataSourceProps } from '../../infrastructure/data/data-source';

export abstract class DataSourceProvider<P extends DataSourceProps> extends React.Component<P> {
    private _dataSource: DataSource;

    public constructor(props: P) {
        super(props);

        this._dataSource = this.createDataSource();
    }

    protected createDataSource(): DataSource {
        return new this.dataSourceType(this.props);
    }

    public render(): JSX.Element {
        return (this.props.children as any)(this._dataSource);
    }

    protected abstract get dataSourceType(): { new(props: DataSourceProps): DataSource }
}