import { DataSourceProvider } from './data-source-provider';
import { ClientDataSource, ClientDataSourceProps } from '../../infrastructure/data/client-data-source';

export class ClientDataSourceProvider extends DataSourceProvider<ClientDataSourceProps> {
    protected get dataSourceType(): { new(props: ClientDataSourceProps): ClientDataSource } {
        return ClientDataSource;
    }
}