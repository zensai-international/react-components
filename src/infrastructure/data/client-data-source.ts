import { ClientDataSourceChangeTracker } from './client-data-source-change-tracker';
import { GroupExpression, SortExpression } from './common';
import { DataSource, DataSourceOperation, DataSourceProps, DataSourceState, DataView, DataViewMode, DataViewProps } from './data-source';
import { DataSourceChange, DataSourceChangeType, DataSourceChangeTracker } from './data-source-change-tracker';
import { DefaultFieldAccessor, FieldAccessor } from './field-accessor';
import { Comparer } from '../comparer';
import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';
import { ExpressionConverter } from '../expressions/expression-converter';

export type ViewInitializer<T> = (view: DataView<T>) => void;

export interface ClientDataSourceProps<T> extends DataSourceProps {
    dataGetter: Promise<T[]> | (() => T[]) | T[];
}

export class ClientDataSource<T = {}> implements DataSource<T> {
    private _changeTracker: DataSourceChangeTracker<T>;
    private _data: T[];
    private _dataGetter: Promise<T[]> | (() => T[]) | T[];
    private _fieldAccessor: FieldAccessor;
    private _onDataBinding: Event<any>;
    private _onDataBound: Event<any>;
    private _operations: { [type: number]: ViewInitializer<T> };
    private _state: DataSourceState;
    private _view: DataView<T>;
    private _viewProps: DataViewProps;

    public constructor(props: ClientDataSourceProps<T>) {
        this._fieldAccessor = props.fieldAccessor;
        this._viewProps = Object.assign({ mode: DataViewMode.CurrentPage, page: { } }, props.view);
        this._operations = this.createOperations(this._viewProps);
        this._changeTracker = new ClientDataSourceChangeTracker<T>(this);
        if (Array.isArray(props.dataGetter)) {
            this._data = props.dataGetter as T[];
        } else {
            this._dataGetter = props.dataGetter;
        }
        this._dataGetter = props.dataGetter;
        this._onDataBinding = new Event<any>();
        this._onDataBound = new Event<any>();
        this._state = DataSourceState.Empty;
        this._view = null;
    }

    protected createFilterOperation(expression: ConditionalExpression): ViewInitializer<T> {
        return x => {
            x.filteredBy = expression;

            if (expression) {
                const expressionConverter = new ExpressionConverter();
                const lambdaExpression = expressionConverter.convert(expression);

                x.data = x.data.filter(lambdaExpression);
            }
        };
    }

    protected createGroupOperation(expression: GroupExpression): ViewInitializer<T> {
        return x => {
            x.groupedBy = expression;

            if (expression) {
                const groups = [];

                for (const item of x.data) {
                    let group = groups.find(x => expression.fields.every(y => this.fieldAccessor.getValue(item, y) == this.fieldAccessor.getValue(x, y)));

                    if (group == null) {
                        group = {};

                        expression.fields.forEach(x => this.fieldAccessor.setValue(group, x, this.fieldAccessor.getValue(item, x)));

                        groups.push(group);
                    }
                }

                x.data = groups;
            }
        };
    }

    protected createInitialView(data: T[], props: DataViewProps): DataView<T> {
        return {
            data: data,
            mode: props.mode,
            totalCount: data.length
        };
    }

    private createOperations(props: DataViewProps): { [type: number]: ViewInitializer<T> } {
        return {
            [DataSourceOperation.Filter]: props.filteredBy ? this.createFilterOperation(props.filteredBy) : null,
            [DataSourceOperation.Sort]: props.sortedBy ? this.createSortOperation(props.sortedBy) : null,
            [DataSourceOperation.Group]: props.groupedBy ? this.createGroupOperation(props.groupedBy) : null,
            [DataSourceOperation.SetPageIndex]: (props.page && props.page.size)
                ? this.createSetPageIndexOperation(props, props.page.index || 0)
                : null
        };
    }

    protected createSetPageIndexOperation(props: DataViewProps, value: number): ViewInitializer<T> {
        const page = props.page;
        const firstIndex = page.size * value
        const lastIndex = page.size * (value + 1);

        return x => {
            x.page = {
                index: value,
                size: page.size
            };
            x.data = (props.mode == DataViewMode.FromFirstToCurrentPage)
                ? x.data.slice(0, lastIndex)
                : x.data.slice(firstIndex, lastIndex);
        };
    }

    protected createSortOperation(expressions: SortExpression[]): ViewInitializer<T> {
        return x => {
            x.sortedBy = expressions;
            x.data = (expressions && (expressions.length > 0))
                ? x.data.concat().sort(this.getComparer(expressions))
                : x.data;
        };
    }

    private getComparer(expressions: SortExpression[]): (x: T, y: T) => number {
        let result = null;

        for (let i = 0; i < expressions.length; i++) {
            const comparer = ((direction, field) =>
                (x, y) => {
                    const xValue = this.fieldAccessor.getValue(x, field);
                    const yValue = this.fieldAccessor.getValue(y, field);

                    return Comparer.instance.compare(xValue, yValue, direction);
                })(expressions[i].direction, expressions[i].field);

            result = (result != null)
                ? ((prevComparer) => (x, y) => prevComparer(x, y))(result)
                : comparer;
        }

        return result;
    }

    protected handleDataBinding() {
        this._state = DataSourceState.Binding;

        this.onDataBinding.trigger(this, {});
    }

    protected handleDataBound() {
        this._state = DataSourceState.Bound;

        this.onDataBound.trigger(this, {});
    }

    protected runOperations(view: DataView<T>, operations: { [type: number]: ViewInitializer<T> }) {
        const executeViewInitializer = (operation: DataSourceOperation) => {
            if (operations[operation]) {
                operations[operation](view);
            }
        };

        executeViewInitializer(DataSourceOperation.Filter);
        executeViewInitializer(DataSourceOperation.Sort);
        executeViewInitializer(DataSourceOperation.Group);
        executeViewInitializer(DataSourceOperation.SetPageIndex);
    }

    public dataBind(): Promise<DataView<T>> {
        const createView = () => {
            this._view = this.createInitialView(this._data, this.viewProps);
            this.runOperations(this._view, this._operations);
        };

        this.handleDataBinding();

        if (!this._data && this._dataGetter && (typeof this._dataGetter == 'function')) {
            this._data = (this._dataGetter as () => T[])();
        }

        if (this._data) {
            createView();
            this.handleDataBound();

            return new Promise<DataView<T>>((resolve: (value?: any) => void) => {
                resolve(this.view);
            });
        } else if (this._dataGetter && (typeof this._dataGetter != 'function')) {
            return (this._dataGetter as Promise<T[]>)
                .then(x => {
                    this._data = x;

                    createView();
                    this.handleDataBound();
                })
                .then(() => this.view);
        }
    }

    public delete(item: T) {
        if (this._data) {
            const index = this._data.indexOf(item);

            this._data.splice(index, 1);

            this.changeTracker.changes.push({
                item: item,
                type: DataSourceChangeType.Delete,
            } as DataSourceChange<T>);
        }
    }

    public filter(expression: ConditionalExpression) {
        this._operations[DataSourceOperation.Filter] = this.createFilterOperation(expression);
    }

    public group(expression: GroupExpression) {
        this._operations[DataSourceOperation.Group] = this.createGroupOperation(expression);
    }

    public getView(props: DataViewProps): DataView<T> {
        const result = this.createInitialView(this._data, props);
        const operations = this.createOperations(props);

        this.runOperations(result, operations);

        return result;
    }

    public read() {
        this._data = null;
        this.changeTracker.apply();

        this.dataBind();
    }

    public setPageIndex(value: number) {
        this._operations[DataSourceOperation.SetPageIndex] = this.createSetPageIndexOperation(this._viewProps, value);
    }

    public sort(expressions: SortExpression[]) {
        this._operations[DataSourceOperation.Sort] = this.createSortOperation(expressions);
    }

    public update(item: T, field: string, value: any) {
        const currentValue = this.fieldAccessor.getValue(item, field);

        this.fieldAccessor.setValue(item, field, value);

        this.changeTracker.changes.push({
            field: field,
            item: item,
            prevValue: currentValue,
            type: DataSourceChangeType.Update,
            value: value
        } as DataSourceChange<T>);
    }

    public get changeTracker(): DataSourceChangeTracker<T> {
        return this._changeTracker;
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