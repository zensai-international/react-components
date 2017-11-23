import { ClientDataSourceChangeTracker } from './client-data-source-change-tracker';
import { FilterExpression, SortExpression } from './common';
import { DataSource, DataSourceState, DataView, DataViewMode } from './data-source';
import { DataSourceChange, DataSourceChangeType, DataSourceChangeTracker } from './data-source-change-tracker';
import { DefaultFieldAccessor, FieldAccessor } from './field-accessor';
import { Comparer } from '../comparer';
import { Event } from '../event';

export interface ClientDataSourceProps {
    fieldAccessor?: FieldAccessor;
    firstPageSize?: number;
    pageSize?: number;
    pageIndex?: number;
    sortedBy?: SortExpression[];
    viewMode?: DataViewMode;
}

export class ClientDataSource<T> implements DataSource<T> {
    private _changeTracker: DataSourceChangeTracker<T>;
    private _data: (() => Promise<T[]>) | T[];
    private _fieldAccessor: FieldAccessor;
    private _firstPageSize: number;
    private _onDataBinging: Event<any>;
    private _onDataBound: Event<any>;
    private _pageSize: number;
    private _setPageIndex: ((view: DataView<T>) => void);
    private _sort: ((view: DataView<T>) => void);
    private _state: DataSourceState;
    private _view: DataView<T>;
    private _viewMode: DataViewMode;

    public constructor(data: T[], props?: ClientDataSourceProps) {
        if (props) {
            this._fieldAccessor = props.fieldAccessor;
            this._firstPageSize = props.firstPageSize || 0;
            this._viewMode = props.viewMode
            if (props.pageSize) {
                this._pageSize = props.pageSize;
                this.setPageIndex(props.pageIndex || 0);
            }

            if (props.sortedBy) {
                this.sort(...props.sortedBy);
            }

        }

        this._changeTracker = new ClientDataSourceChangeTracker<T>(this);
        this._data = data;
        this._onDataBinging = new Event<any>();
        this._onDataBound = new Event<any>();
        this._state = DataSourceState.Empty;
        this._view = null;
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

    protected internalDataBind(data: T[]) {
        this._view = this._view || {};
        this._view.data = data;

        if (this._sort)
        {
            this._sort(this._view);
        }

        if (this._setPageIndex) {
            this._setPageIndex(this._view);
        }
    }

    public dataBind() {
        this.handleDataBinding();

        if (this._data != null) {
            const data = this._data as T[];

            if (data) {
                this.internalDataBind(data);
                this.handleDataBound();
            } else {
                (this._data as (() => Promise<T[]>))().then(x => {
                    this._data = x;

                    this.internalDataBind(x);
                    this.handleDataBound();
                });
            }
        }
    }

    public setPageIndex(value: number) {
        const firstIndex = this.firstPageSize
            ? (value ? this.firstPageSize + this.pageSize * (value - 1) : 0)
            : this.pageSize * value
        const lastIndex = this.firstPageSize
            ? (value ? this.firstPageSize + this.pageSize * value : this.firstPageSize)
            : this.pageSize * (value + 1);

        this._setPageIndex = x => {
            x.pageIndex = value;
            x.data = (this._viewMode == DataViewMode.FromFirstToCurrentPage)
                ? x.data.slice(0, lastIndex)
                : x.data.slice(firstIndex, lastIndex);
        };
    }
    public filter(...expressions: FilterExpression[]) {
        this._sort = x => {
            x.filteredBy = expressions;
            x.data = x.data.filter(expressions[0].expression)
        };
    }

    public sort(...expressions: SortExpression[]) {
        this._sort = x => {
            x.sortedBy = expressions;
            x.data = (expressions && (expressions.length > 0))
                ? x.data.concat().sort(this.getComparer(expressions))
                : x.data;
        };
    }

    public update(model: T, field: string, value: any) {
        const currentValue = this.fieldAccessor.getValue(model, field);

        this.fieldAccessor.setValue(model, field, value);

        this.changeTracker.changes.push({
            field: field,
            model: model,
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

    public get firstPageSize(): number {
        return this._firstPageSize;
    }

    public get pageSize(): number {
        return this._pageSize;
    }

    public get state(): DataSourceState {
        return this._state;
    }

    public get totalCount(): number {
        return this._data.length;
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