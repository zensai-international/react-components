import { DataSource, DataSourceProps, DataSourceState, DataView } from './data-source';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { DefaultFieldAccessor, FieldAccessor } from './field-accessor';
import { Event } from '../event';
import { Uri, UriBuilder, UriParser } from '../uri';
import { SortExpression, SortDirection } from './common';
// import { FilterExpression } from '../expressions/expression';

export interface ODataDataSourceProps extends DataSourceProps {
    dataGetter: (url: string) => Promise<any>;
    fieldMappings?: { [field: string]: string };
    modelConverter?: (value: any) => any;
    url: string;
}

export class ODataDataSource<T> implements DataSource<T> {
    private _dataGetter: (url: string) => Promise<any>;
    private _fieldAccessor: FieldAccessor;
    private _fieldMappings: { [field: string]: string };
    private _modelConverter: (value: any) => any;
    private _onDataBinging: Event<any>;
    private _onDataBound: Event<any>;
    private _state: DataSourceState;
    private _totalCount: number;
    private _sortedBy: SortExpression[];
    private _url: Uri;
    private _view: DataView<T>;

    public constructor(props: ODataDataSourceProps) {
        this._dataGetter = props.dataGetter;
        this._fieldAccessor = props.fieldAccessor;
        this._fieldMappings = props.fieldMappings;
        this._modelConverter = props.modelConverter;
        this._state = DataSourceState.Empty;
        this._url = new UriParser().parse(props.url);
        this._view = null;

        this._onDataBinging = new Event<any>();
        this._onDataBound = new Event<any>();
    }

    protected handleDataBinding() {
        this._state = DataSourceState.Binding;

        this.onDataBinding.trigger(this, {});
    }

    protected handleDataBound() {
        this._state = DataSourceState.Bound;

        this.onDataBound.trigger(this, {});
    }

    protected addSortToUrl(urlBuilder: UriBuilder) {
        if (this._sortedBy) {
            const sortDirectionAsString = {
                [SortDirection.Ascending]: 'asc',
                [SortDirection.Descending]: 'desc'
            };
            let parameterValue = '';

            for (let i = 0; i < this._sortedBy.length; i++) {
                const sortExpression = this._sortedBy[i];
                const field = this._fieldMappings
                    ? this._fieldMappings[sortExpression.field] || sortExpression.field
                    : sortExpression.field;

                if (parameterValue != '') {
                    parameterValue += ',';
                }
                parameterValue += `${field} ${sortDirectionAsString[sortExpression.direction]}`;
            }

            if (parameterValue) {
                urlBuilder.addQueryParameter('$orderby', parameterValue);
            }
        }
    }

    public dataBind(): Promise<DataView<T>> {
        const uriBuilder = new UriBuilder(this._url);

        this.handleDataBinding();

        if (this._totalCount == null) {
            uriBuilder.addQueryParameter('$count', true);
        }

        this.addSortToUrl(uriBuilder);

        const generatedUrl = uriBuilder.build();

        return this._dataGetter(generatedUrl)
            .then(x => {
                const data = this._modelConverter
                    ? x['value'].map(x => this._modelConverter(x))
                    : x['value'] as T[];

                if (!this._totalCount) {
                    this._totalCount = x['@odata.count'];
                }

                this._view = {
                    data: data,
                    sortedBy: this._sortedBy
                };

                this.handleDataBound();

                return this._view;
            });
    }

    public filter(/*...expressions: FilterExpression[]*/) {
        
    }

    public setPageIndex(/*value: number*/) {
        
    }

    public sort(...expressions: SortExpression[]) {
        this._sortedBy = expressions;
    }

    public update(/*model: T, field: string, value: any*/) {
        
    }

    public get changeTracker(): DataSourceChangeTracker<T> {
        return null;
    }

    public get fieldAccessor(): FieldAccessor {
        return this._fieldAccessor = this._fieldAccessor || new DefaultFieldAccessor();
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
        return this._view;
    }

    public get onDataBinding(): Event<any> {
        return this._onDataBinging;
    }

    public get onDataBound(): Event<any> {
        return this._onDataBound;
    }
}