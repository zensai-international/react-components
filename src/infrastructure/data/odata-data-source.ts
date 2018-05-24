
import { GroupExpression, SortDirection, SortExpression } from './common';
import { DataSource, DataSourceProps, DataSourceOperation, DataSourceState, DataView, DataViewMode, DataViewProps } from './data-source';
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
    data: (url: string) => Promise<any>;
    fieldMappings?: { [field: string]: string };
    itemConverter?: (value: any) => any;
    url: string;
}

export interface DataSourceOperationData<T> {
    urlGenerator: (uriBuilder: UriBuilder) => void;
    viewInitializer: (response: any, view: DataView<T>) => void;
}

export class ODataDataSource<T = {}> implements DataSource<T> {
    private _data: (url: string) => Promise<any>;
    private _fieldAccessor: FieldAccessor;
    private _fieldMappings: { [field: string]: string };
    private _itemConverter: (value: any) => any;
    private _onDataBinding: Event<any>;
    private _onDataBound: Event<any>;
    private _operations: { [type: number]: DataSourceOperationData<T> };
    private _state: DataSourceState;
    private _url: Uri;
    private _view: DataView<T>;
    private _viewProps: DataViewProps;

    public constructor(props: ODataDataSourceProps) {
        this._data = props.data;
        this._fieldAccessor = props.fieldAccessor;
        this._fieldMappings = props.fieldMappings;
        this._itemConverter = props.itemConverter;
        this._operations = {};
        this._state = DataSourceState.Empty;
        this._url = new UriParser().parse(props.url);
        this._view = null;
        this._viewProps = Object.assign({ page: { } }, props.view);

        this._onDataBinding = new Event<any>();
        this._onDataBound = new Event<any>();

        this._operations = {
            [DataSourceOperation.GetCount]: this.createGetCountOperation()
        };

        if (this._viewProps.page) {
            this.setPageIndex(this._viewProps.page.index || 0);
            if (this._viewProps.filteredBy) {
                this.filter(this._viewProps.filteredBy);
            }
            if (this._viewProps.sortedBy) {
                this.sort(this._viewProps.sortedBy);
            }
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

    protected createFilterOperation(expression: ConditionalExpression): DataSourceOperationData<T> {
        return {
            urlGenerator: (uriBuilder: UriBuilder) => this.addFilterOperationToUrl(uriBuilder, expression),
            viewInitializer: (response: any, view: DataView<T>) => {
                view.filteredBy = expression;
            }
        };
    }

    protected createGetCountOperation(): DataSourceOperationData<T> {
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

    protected createSetIndexOperation(value: number): DataSourceOperationData<T> {
        const page = this.viewProps.page;

        return {
            urlGenerator: (uriBuilder: UriBuilder) => {
                if (page.size) {
                    const pager = new DataSourcePager(this);
                    const nextPage = pager.getPageInfo(value);

                    uriBuilder.addQueryParameter('$skip', nextPage.firstIndex);
                    uriBuilder.addQueryParameter('$top', nextPage.lastIndex - nextPage.firstIndex + 1);
                }
            },
            viewInitializer: (response: any, view: DataView<T>) => {
                view.data = this._view && (this._view.mode == DataViewMode.FromFirstToCurrentPage) && (this._view.page.index != value)
                    ? this._view.data.concat(view.data)
                    : view.data;
                view.mode = this.viewProps.mode;
                view.page = {
                    index: value,
                    size: page.size
                };
            }
        };
    }

    protected createSortAction(expressions: SortExpression[]): DataSourceOperationData<T> {
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
        const result = {
            data: data,
            totalCount: this._view ? this._view.totalCount : null
        };

        for (let operationKey in this._operations) {
            this._operations[operationKey].viewInitializer(response, result);
        }

        return result;
    }

    protected generateUrl(): string {
        const uriBuilder = new UriBuilder(this._url);

        for (let operationKey in this._operations) {
            this._operations[operationKey].urlGenerator(uriBuilder);
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

        return this._data(generatedUrl)
            .then(x => {
                this._view = this.createView(x);

                this.handleDataBound();

                return this._view;
            });
    }

    public delete(item: T) {
    }

    public getView(props: DataViewProps): Promise<DataView<T>> {
        throw new Error('Method not implemented.');
    }

    public group(expression: GroupExpression) {
        throw new Error('Method not implemented.');
    }

    public filter(expression: ConditionalExpression) {
        this.setPageIndex(0);

        if (this.view) {
            this.view.data = [];
        }

        this._operations[DataSourceOperation.Filter] = this.createFilterOperation(expression);
    }

    public read() {
    }

    public setPageIndex(value: number) {
        this._operations[DataSourceOperation.SetPageIndex] = this.createSetIndexOperation(value);
    }

    public sort(expressions: SortExpression[]) {
        this.setPageIndex(0);

        if (this.view) {
            this.view.data = [];
        }

        this._operations[DataSourceOperation.Sort] = this.createSortAction(expressions);
    }

    public update(/*item: T, field: string, value: any*/) {
    }

    public get changeTracker(): DataSourceChangeTracker<T> {
        return null;
    }

    public get fieldAccessor(): FieldAccessor {
        return this._fieldAccessor = this._fieldAccessor || new DefaultFieldAccessor();
    }

    public get state(): DataSourceState {
        return this._state;
    }

    public get view(): DataView<T> {
        return this._view;
    }

    public get viewProps(): DataViewProps {
        return this._viewProps;
    }

    public get onDataBinding(): Event<any> {
        return this._onDataBinding;
    }

    public get onDataBound(): Event<any> {
        return this._onDataBound;
    }
}