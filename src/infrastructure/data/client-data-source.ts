import { Comparer } from '../comparer';
import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';
import { ExpressionConverter } from '../expressions/expression-converter';
import { ObjectHelper } from '../helpers/object-helper';
import { ClientDataSourceChangeTracker } from './client-data-source-change-tracker';
import { GroupExpression, SortExpression } from './common';
import { DataSource, DataSourceOperation, DataSourceProps, DataSourceState, DataView, DataViewMode, DataViewProps } from './data-source';
import { DataSourceChange, DataSourceChangeTracker, DataSourceChangeType } from './data-source-change-tracker';
import { DefaultFieldAccessor, FieldAccessor } from './field-accessor';

export type ViewInitializer<T> = (view: DataView<T>) => void;

export interface ClientDataSourceProps<T = {}> extends DataSourceProps {
    data: (() => Promise<T[]>) | Promise<T[]> | (() => T[]) | T[];
}

export class ClientDataSource<T = {}> implements DataSource<T> {
    private _changeTracker: DataSourceChangeTracker<T>;
    private _data: T[];
    private _fieldAccessor: FieldAccessor;
    private _onDataBinding: Event<any>;
    private _onDataBound: Event<any>;
    private _operations: { [type: number]: ViewInitializer<T> };
    private _state: DataSourceState;
    private _view: DataView<T>;
    private _props: ClientDataSourceProps<T>;

    public constructor(props: ClientDataSourceProps<T>) {
        this._fieldAccessor = props.fieldAccessor;
        this._props = Object.assign({}, props, { view: Object.assign({ mode: DataViewMode.CurrentPage, page: {} }, props.view) });
        this._operations = this.createOperations(this._props.view);
        this._changeTracker = new ClientDataSourceChangeTracker<T>(this);
        this._onDataBinding = new Event<any>();
        this._onDataBound = new Event<any>();
        this._state = DataSourceState.Empty;
        this._view = null;

        if (Array.isArray(props.data)) {
            this._data = props.data as T[];
        }
    }

    protected createFilterOperation(expression: ConditionalExpression): ViewInitializer<T> {
        return x => {
            x.filteredBy = expression;

            if (expression) {
                const expressionConverter = new ExpressionConverter();
                const lambdaExpression = expressionConverter.convert(expression);

                x.data = x.data.filter(lambdaExpression);
                x.totalCount = x.data.length;
            }
        };
    }

    protected createGroupOperation(expression: GroupExpression): ViewInitializer<T> {
        return x => {
            x.groupedBy = expression;

            if (expression) {
                const groups = [];
                const fields = expression.fields;

                for (const item of x.data) {
                    const group = ObjectHelper.create(this.fieldAccessor, fields, fields.map(y => this.fieldAccessor.getValue(item, y)));
                    const comparer = (x, y, field) => this.fieldAccessor.getValue(x, field) == this.fieldAccessor.getValue(y, field);
                    const existedGroup = groups.find(y => fields.every(field => comparer(y, item, field)));

                    if (existedGroup == null) {
                        groups.push(group);
                    }
                }

                x.data = groups;
            }
        };
    }

    protected createInitialView(data: T[], props: DataViewProps): DataView<T> {
        return {
            data,
            mode: props.mode,
            totalCount: data.length,
        };
    }

    private createOperations(props: DataViewProps): { [type: number]: ViewInitializer<T> } {
        return {
            [DataSourceOperation.Filter]: props.filteredBy ? this.createFilterOperation(props.filteredBy) : null,
            [DataSourceOperation.Sort]: props.sortedBy ? this.createSortOperation(props.sortedBy) : null,
            [DataSourceOperation.Group]: props.groupedBy ? this.createGroupOperation(props.groupedBy) : null,
            [DataSourceOperation.SetPageIndex]: (props.page && props.page.size)
                ? this.createSetPageIndexOperation(props, props.page.index || 0)
                : null,
        };
    }

    protected createSetPageIndexOperation(props: DataViewProps, value: number): ViewInitializer<T> {
        const page = props.page;
        const firstIndex = page.size * value;
        const lastIndex = page.size * (value + 1);

        return x => {
            x.page = {
                index: value,
                size: page.size,
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
        function mergeComparer(prevComparer: (x: T, y: T) => number, comparer: (x: T, y: T) => number): ((x: T, y: T) => number) {
            return (x: T, y: T) => prevComparer
                ? prevComparer(x, y) || comparer(x, y)
                : comparer(x, y);
        }

        let result = null;

        for (let i = 0; i < expressions.length; i++) {
            const comparer = ((direction, field) =>
                (x, y) => {
                    const xValue = this.fieldAccessor.getValue(x, field);
                    const yValue = this.fieldAccessor.getValue(y, field);

                    return Comparer.instance.compare(xValue, yValue, direction);
                })(expressions[i].direction, expressions[i].field);

            result = result ? mergeComparer(result, comparer) : comparer;
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

    public dataBind(data?: T[]): Promise<DataView<T>> {
        const createView = () => {
            const result = this.createInitialView(this._data, this.viewProps);
            this.runOperations(result, this._operations);

            return result;
        };
        const handlePromise = (promise: Promise<T[]>): Promise<DataView<T>> => {
            return promise
                .then(x => {
                    this._data = x;

                    this._view = createView();
                    this.handleDataBound();
                })
                .then(() => this.view);
        };

        this.handleDataBinding();

        if (data) {
            this._data = data;
        } else if (!this._data && this._props.data && ObjectHelper.isFunction(this._props.data)) {
            const funcResult = (this._props.data as () => T[])();

            if (funcResult instanceof Array) {
                this._data = funcResult;
            } else if (funcResult as Promise<T[]>) {
                return handlePromise(funcResult);
            }
        }

        if (this._data) {
            this._view = createView();
            this.handleDataBound();

            return new Promise<DataView<T>>((resolve: (value?: any) => void) => {
                resolve(this.view);
            });
        }

        if (this._props.data && !ObjectHelper.isFunction(this._props.data)) {
            return handlePromise(this._props.data as Promise<T[]>);
        }
    }

    public delete(item: T) {
        if (this._data) {
            const index = this._data.indexOf(item);

            this._data.splice(index, 1);

            const change = {
                item,
                type: DataSourceChangeType.Delete,
            } as DataSourceChange<T>;

            this.changeTracker.changes.push(change);

            this.changeTracker.onChange.trigger(this.changeTracker, change);
        }
    }

    public filter(expression: ConditionalExpression) {
        this._operations[DataSourceOperation.Filter] = this.createFilterOperation(expression);
    }

    public group(expression: GroupExpression) {
        this._operations[DataSourceOperation.Group] = this.createGroupOperation(expression);
    }

    public getView(props: DataViewProps): Promise<DataView<T>> {
        const createView = () => {
            const result = this.createInitialView(this._data, props);
            const operations = this.createOperations(props);

            this.runOperations(result, operations);

            return result;
        };

        switch (this.state) {
            case DataSourceState.Empty:
                return this.dataBind().then(() => createView());
            case DataSourceState.Binding:
                return new Promise<DataView<T>>((resolve: (view: DataView<T>) => void) => {
                    const handleDataBound = () => {
                        const view = createView();

                        this.onDataBound.off(handleDataBound);

                        resolve(view);
                    };

                    this.onDataBound.on(handleDataBound);
                });
            case DataSourceState.Bound:
                return Promise.resolve(createView());
        }
    }

    public read(): Promise<DataView> {
        this._data = null;
        this._view = null;
        this.changeTracker.apply();

        return this.dataBind();
    }

    public setPageIndex(value: number) {
        this._operations[DataSourceOperation.SetPageIndex] = this.createSetPageIndexOperation(this.viewProps, value);
    }

    public sort(expressions: SortExpression[]) {
        this._operations[DataSourceOperation.Sort] = this.createSortOperation(expressions);
    }

    public update(item: T, field: string, value: any) {
        const currentValue = this.fieldAccessor.getValue(item, field);

        this.fieldAccessor.setValue(item, field, value);

        const change = {
            field,
            item,
            prevValue: currentValue,
            type: DataSourceChangeType.Update,
            value,
        } as DataSourceChange<T>;

        this.changeTracker.changes.push(change);

        this.changeTracker.onChange.trigger(this.changeTracker, change);
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
        return this._props.view;
    }

    public get onDataBinding(): Event<any> {
        return this._onDataBinding;
    }

    public get onDataBound(): Event<any> {
        return this._onDataBound;
    }
}