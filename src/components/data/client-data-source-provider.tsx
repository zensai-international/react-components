import { ClientDataSource, ClientDataSourceProps } from '../../infrastructure/data/client-data-source';
import { DataSourceProvider } from './data-source-provider';

export class ClientDataSourceProvider extends DataSourceProvider<ClientDataSourceProps> {
    public componentWillReceiveProps(nextProps: ClientDataSourceProps) {
        if ((this.props.data != nextProps.data)
            && ((this.props.data == null) || Array.isArray(this.props.data))
            && ((nextProps.data == null) || Array.isArray(nextProps.data))) {
            (this.dataSource as ClientDataSource).dataBind(nextProps.data as any[]);
        }
    }

    protected get dataSourceType(): { new (props: ClientDataSourceProps): ClientDataSource } {
        return ClientDataSource;
    }
}