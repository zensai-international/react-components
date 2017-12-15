
import { SortExpression, SortDirection } from './common';
import { DataSource, DataSourceProps, DataSourceState, DataView, DataViewMode } from './data-source';
import { DataSourceChangeTracker } from './data-source-change-tracker';
import { DataSourcePager } from './data-source-pager';
import { DefaultFieldAccessor, FieldAccessor } from './field-accessor';
import { Event } from '../event';
import { Uri } from '../uri';
import { UriBuilder } from '../uri-builder';
import { UriParser } from '../uri-parser';
import { ConditionalExpression, ComparisonExpression, ComparisonOperator, LogicalOperator } from '../expressions/expression';
import { ExpressionVisitor } from '../expressions/expression-visitor';

export interface ODataDataSourceProps extends DataSourceProps {
    dataGetter: (url: string) => Promise<any>;
    fieldMappings?: { [field: string]: string };
    itemlConverter?: (value: any) => any;
    url: string;
}

export interface DataSourceAction<T> {
    urlGenerator: (uriBuilder: UriBuilder) => void;
    viewInitializer: (response: any, view: DataView<T>) => void;
}

export enum DataSourceOperation {
    Filter,
    GetCount,
    SetPageIndex,
    Sort
}

export class ODataDataSource<T = any> implements DataSource<T> {
    private _actions: { [type: number]: DataSourceAction<T> };
    private _dataGetter: (url: string) => Promise<any>;
    private _fieldAccessor: FieldAccessor;
    private _fieldMappings: { [field: string]: string };
    private _itemConverter: (value: any) => any;
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
        this._itemConverter = props._itemConverter;
        this._pageSize = props.pageSize;
        this._state = DataSourceState.Empty;
        this._url = new UriParser().parse(props.url);
        this._view = null;
        this._viewMode = props.viewMode || DataViewMode.CurrentPage;

        this._onDataBinging = new Event<any>();
        this._onDataBound = new Event<any>();

        this._actions = {
            [DataSourceOperation.GetCount]: this.createGetCountAction()
        };

        this.setPageIndex(props.pageIndex || 0);
        if (props.sortedBy) {
            this.sort(props.sortedBy);
        }
    }

    // TODO: Need refactoring.
    protected addFilterOperationToUrl(urlBuilder: UriBuilder, expression: ConditionalExpression) {
        const comparisonOperatorAsString = {
            [ComparisonOperator.Contain]: 'contains',
            [ComparisonOperator.Equal]: 'eq',
            [ComparisonOperator.Greater]: 'gt',
            [ComparisonOperator.GreaterOrEqual]: 'ge',
            [ComparisonOperator.Less]: 'lt',
            [ComparisonOperator.LessOrEqual]: 'le',
            [ComparisonOperator.NotEqual]: 'ne'
        };
        const logicalOperatorAsString = {
            [LogicalOperator.And]: 'and',
            [LogicalOperator.Or]: 'or'
        };

        if (expression) {
            const expressionVisitor = new ExpressionVisitor({
                onVisitComparison: (expression: ComparisonExpression) => {
                    const field = this._fieldMappings
                        ? this._fieldMappings[expression.field] || expression.field
                        : expression.field;
                    const value = expression.value;
                    let valueAsString = null;

                    if (value instanceof Date) {
                        valueAsString = (value as Date).toISOString();
                    } else if (typeof value == 'string') {
                        valueAsString = '\''+ value + '\'';
                    } else  if (value != null) {
                        valueAsString = value.toString();
                    }

                    switch (expression.operator) {
                        case ComparisonOperator.Contain:
                            return `${comparisonOperatorAsString[expression.operator]}(${field}, ${valueAsString})`;
                        default:
                            return `${field} ${comparisonOperatorAsString[expression.operator]} ${valueAsString}`;
                    }
                },
                onVisitLogical: (left: string, operator: LogicalOperator, right: string) => {
                    return `(${left} ${logicalOperatorAsString[operator]} ${right})`;
                }
            });

            urlBuilder.addQueryParameter('$filter', expressionVisitor.visit(expression));
        }
    }

    protected addSortOperationToUrl(urlBuilder: UriBuilder, expressions: SortExpression[]) {
        const sortDirectionAsString = {
            [SortDirection.Ascending]: 'asc',
            [SortDirection.Descending]: 'desc'
        };
        const parameterValueParts = [];

        for (let i = 0; i < expressions.length; i++) {
            const sortExpression = expressions[i];
            const field = this._fieldMappings
                ? this._fieldMappings[sortExpression.field] || sortExpression.field
                : sortExpression.field;

            parameterValueParts.push( `${field} ${sortDirectionAsString[sortExpression.direction]}`);
        }

        if (parameterValueParts.length) {
            urlBuilder.addQueryParameter('$orderby', parameterValueParts.join(','));
        }
    }

    protected createFilterAction(expression: ConditionalExpression): DataSourceAction<T> {
        return {
            urlGenerator: (uriBuilder: UriBuilder) => this.addFilterOperationToUrl(uriBuilder, expression),
            viewInitializer: (response: any, view: DataView<T>) => {
                view.filteredBy = expression;
            }
        };
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
                if (this.pageSize) {
                    const pager = new DataSourcePager(this);
                    const nextPage = pager.getPageInfo(value);

                    uriBuilder.addQueryParameter('$skip', nextPage.firstIndex);
                    uriBuilder.addQueryParameter('$top', nextPage.lastIndex - nextPage.firstIndex + 1);
                }
            },
            viewInitializer: (response: any, view: DataView<T>) => {
                view.data = this._view && (this._view.mode == DataViewMode.FromFirstToCurrentPage) && (this._view.pageIndex == (value -1))
                    ? this._view.data.concat(view.data)
                    : view.data;
                view.mode = this._viewMode;
                view.pageIndex = value;
            }
        };
    }

    protected createSortAction(expressions: SortExpression[]): DataSourceAction<T> {
        return {
            urlGenerator: (uriBuilder: UriBuilder) => this.addSortOperationToUrl(uriBuilder, expressions),
            viewInitializer: (response: any, view: DataView<T>) => {
                view.sortedBy = expressions;
            }
        };
    }

    protected createView(response: any): DataView<T> {

        const data = this._itemConverter
            ? response['value'].map(x => this._itemConverter(x))
            : response['value'] as T[];
        const result = { data: data, totalCount: this._view ? this._view.totalCount : null };

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
        this.handleDataBinding();

        const generatedUrl = this.generateUrl();

        return this._dataGetter(generatedUrl)
            .then(x => {
                this._view = this.createView(x);

                this.handleDataBound();

                return this._view;
            });
    }

    public filter(expression: ConditionalExpression) {
        this.setPageIndex(0);

        if (this.view) {
            this.view.data = [];
        }

        this._actions[DataSourceOperation.Filter] = this.createFilterAction(expression);
    }

    public setPageIndex(value: number) {
        this._actions[DataSourceOperation.SetPageIndex] = this.createSetIndexAction(value);
    }

    public sort(expressions: SortExpression[]) {
        this.setPageIndex(0);

        if (this.view) {
            this.view.data = [];
        }

        this._actions[DataSourceOperation.Sort] = this.createSortAction(expressions);
    }

    public update(/*item: T, field: string, value: any*/) {
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