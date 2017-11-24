import { DataSource, DataSourceProps, DataSourceState, DataView } from './data-source';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { FieldAccessor } from './field-accessor';
import { Event } from '../event';
import { Uri, UriBuilder, UriParser } from '../uri';
// import { FilterExpression } from '../expressions/expression';

export interface ODataDataSourceProps extends DataSourceProps {
    dataGetter: (url: string) => Promise<any>;
    fieldMappings?: { [field: string]: string };
    modelConverter?: (value: any) => any;
    url: string;
}

export class ODataDataSource<T> implements DataSource<T> {
    private _dataGetter: (url: string) => Promise<any>;
    private _onDataBinging: Event<any>;
    private _onDataBound: Event<any>;
    private _state: DataSourceState;
    private _totalCount: number;
    private _url: Uri;
    private _view: DataView<T>;

    public constructor(props: ODataDataSourceProps) {
        this._dataGetter = props.dataGetter;
        this._state = DataSourceState.Empty;
        this._url = new UriParser().parse(props.url);

        this._onDataBinging = new Event<any>();
        this._onDataBound = new Event<any>();
    }

    public dataBind(): Promise<DataView<T>> {
        const uriBuilder = new UriBuilder(this._url);

        if (this._totalCount == null) {
            uriBuilder.addQueryParameter('$count', true);
        }

        const generatedUrl = uriBuilder.build();

        return this._dataGetter(generatedUrl)
            .then(x => {
                const data = x['value'] as T[];

                if (!this._totalCount) {
                    this._totalCount = x['@odata.count'];
                }

                this._view = {
                    data: data
                };

                return this._view;
            });
    }

    public filter(/*...expressions: FilterExpression[]*/) {
        
    }

    public setPageIndex(/*value: number*/) {
        
    }

    public sort(/*...expressions: SortExpression[]*/) {
        
    }

    public update(/*model: T, field: string, value: any*/) {
        
    }

    public get changeTracker(): DataSourceChangeTracker<T> {
        return null;
    }

    public get fieldAccessor(): FieldAccessor {
        return null;
    }

    public get firstPageSize(): number {
        return null;
    }

    public get pageSize(): number {
        return null;
    }

    public get state(): DataSourceState {
        return this._state;
    }

    public get totalCount(): number {
        return null;
    }

    public get view(): DataView<T> {
        return null;
    }

    public get onDataBinding(): Event<any> {
        return this._onDataBinging;
    }

    public get onDataBound(): Event<any> {
        return this._onDataBound;
    }
}