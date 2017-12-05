import { DataSource, DataSourceProps, DataSourceState, DataView, DataViewMode } from './data-source';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { DataSourcePager } from './data-source-pager';
import { DefaultFieldAccessor, FieldAccessor } from './field-accessor';
import { Event } from '../event';
import { Uri } from '../uri';
import { UriBuilder } from '../uri-builder';
import { UriParser } from '../uri-parser';
import { SortExpression, SortDirection } from './common';
// import { FilterExpression } from '../expressions/expression';

export interface ODataDataSourceProps extends DataSourceProps {
    dataGetter: (url: string) => Promise<any>;
    fieldMappings?: { [field: string]: string };
    modelConverter?: (value: any) => any;
    url: string;
}

export interface DataSourceAction<T> {
    urlGenerator: (uriBuilder: UriBuilder) => void;
    viewInitializer: (response: any, view: DataView<T>) => void;
}

export enum DataSourceActionType {
    GetCount,
    SetPageIndex,
    Sort
}

export class ODataDataSource<T> implements DataSource<T> {
    private _actions: { [type: number]: DataSourceAction<T> };
    private _dataGetter: (url: string) => Promise<any>;
    private _fieldAccessor: FieldAccessor;
    private _fieldMappings: { [field: string]: string };
    private _modelConverter: (value: any) => any;
    private _onDataBinging: Event<any>;
    private _onDataBound: Event<any>;
    private _pageSize: number;
    private _state: DataSourceState;
    private _url: Uri;
    private _view: DataView<T>;
    private _viewMode: DataViewMode;

    public constructor(props: ODataDataSourceProps) {
        this._actions = [];
        this._dataGetter = props.dataGetter;
        this._fieldAccessor = props.fieldAccessor;
        this._fieldMappings = props.fieldMappings;
        this._modelConverter = props.modelConverter;
        this._pageSize = props.pageSize;
        this._state = DataSourceState.Empty;
        this._url = new UriParser().parse(props.url);
        this._view = null;
        this._viewMode = props.viewMode || DataViewMode.CurrentPage;

        this._onDataBinging = new Event<any>();
        this._onDataBound = new Event<any>();

        this._actions = {
            [DataSourceActionType.GetCount]: this.createGetCountAction()
        };

        this.setPageIndex(props.pageIndex || 0);
        if (props.sortedBy) {
            this.sort(...props.sortedBy);
        }
    }

    protected addSortToUrl(urlBuilder: UriBuilder, expressions: SortExpression[]) {
        const sortDirectionAsString = {
            [SortDirection.Ascending]: 'asc',
            [SortDirection.Descending]: 'desc'
        };
        let parameterValue = '';

        for (let i = 0; i < expressions.length; i++) {
            const sortExpression = expressions[i];
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

    protected createGetCountAction(): DataSourceAction<T> {
        return {
            urlGenerator: (uriBuilder: UriBuilder) => {
                if ((this.view == null) || !this.view.totalCount) {
                    uriBuilder.addQueryParameter('$count', true);
                }
            },
            viewInitializer: (response: any, view: DataView<T>) => {
                if (response['@odata.count']) {
                    view.totalCount = response['@odata.count'];
                }
            }
        };
    }

    protected createSetIndexAction(value: number): DataSourceAction<T> {
        return {
            urlGenerator: (uriBuilder: UriBuilder) => {
                if (value) {
                    const pager = new DataSourcePager(this);
                    const nextPage = pager.getPageInfo(value);

                    uriBuilder.addQueryParameter('$skip', nextPage.firstIndex);
                    uriBuilder.addQueryParameter('$top', nextPage.lastIndex - nextPage.firstIndex + 1);
                }
            },
            viewInitializer: (response: any, view: DataView<T>) => {
                view.data = this._view && (this._view.mode == DataViewMode.FromFirstToCurrentPage)
                    ? this._view.data.concat(view.data)
                    : view.data;
                view.mode = this._viewMode;
                view.pageIndex = value;
            }
        };
    }

    protected createSortAction(expressions: SortExpression[]): DataSourceAction<T> {
        return {
            urlGenerator: (uriBuilder: UriBuilder) => this.addSortToUrl(uriBuilder, expressions),
            viewInitializer: (response: any, view: DataView<T>) => {
                view.sortedBy = expressions;
            }
        };
    }

    protected createView(response: any): DataView<T> {
        const data = this._modelConverter
            ? response['value'].map(x => this._modelConverter(x))
            : response['value'] as T[];
        const result = { data: data };

        for (let action in this._actions) {
            this._actions[action].viewInitializer(response, result);
        }

        return result;
    }

    protected generateUrl(): string {
        const uriBuilder = new UriBuilder(this._url);

        for (let action in this._actions) {
            this._actions[action].urlGenerator(uriBuilder);
        }

        return uriBuilder.build();
    }

    protected handleDataBinding() {
        this._state = DataSourceState.Binding;

        this.onDataBinding.trigger(this, {});
    }

    protected handleDataBound() {
        this._state = DataSourceState.Bound;

        this.onDataBound.trigger(this, {});
    }

    public async dataBind(): Promise<DataView<T>> {
        const generatedUrl = this.generateUrl();

        this.handleDataBinding();

        return this._dataGetter(generatedUrl)
            .then(x => {
                this._view = this.createView(x);

                this.handleDataBound();

                return this._view;
            });
    }

    public filter(/*...expressions: FilterExpression[]*/) {
    }

    public setPageIndex(value: number) {
        this._actions[DataSourceActionType.SetPageIndex] = this.createSetIndexAction(value);
    }

    public sort(...expressions: SortExpression[]) {
        this._actions[DataSourceActionType.SetPageIndex] = this.createSortAction(expressions);
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
        return this._pageSize;
    }

    public get state(): DataSourceState {
        return this._state;
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