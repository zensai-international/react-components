import * as React from 'react';
import { GridComponent } from './grid-component';
import { GridColumn } from './grid-column';
import { SortDirection } from '../../infrastructure/data/common';
import { DataView } from '../../infrastructure/data/data-source';
import { ConditionalExpression, ComparisonOperator } from '../../infrastructure/expressions/expression';

export interface GridColumnFilterProps {
    column: GridColumn;
    expression: ConditionalExpression;
}

export class GridColumnFilter<P extends GridColumnFilterProps = GridColumnFilterProps, S = {}> extends GridComponent<P, S> {
    protected handleFilter(value: any | any[]) {
        const filterContext = this.context.filterContext;
        const field = this.props.column.props.field;

        if (value && (!(value instanceof Array) || value.length)) {
            filterContext.add(
                field,
                {
                    field: field,
                    operator: (value instanceof Array) ? ComparisonOperator.Any : ComparisonOperator.Contain,
                    value: value
                });
        } else {
            filterContext.delete([field]);
        }
    }
}

export interface GridColumnFilterByValueListState {
    values: DataView;
}

export abstract class GridColumnFilterByValueList<P extends GridColumnFilterProps = GridColumnFilterProps, S extends GridColumnFilterByValueListState = GridColumnFilterByValueListState> extends GridColumnFilter<P, S> {
    public constructor(props: P) {
        super(props);

        this.state = { values: null } as S;
    }

    protected async getDataView(): Promise<DataView> {
        const grid = this.context.grid;
        const filterContext = this.context.filterContext;
        const dataSource = grid.props.dataSource;
        const field = this.props.column.props.field;

        return dataSource.getView({
            filteredBy: filterContext.build([field]),
            groupedBy: { fields: [field] },
            sortedBy: [{ direction: SortDirection.Ascending, field: field }]
        });
    }

    public componentDidMount() {
        this.getDataView()
            .then(x => {
                this.setState({ values: x });
            });
    }

    public abstract renderIfValuesLoaded(): JSX.Element;

    public render(): JSX.Element {
        const Spinner = this.context.spinnerType;

        return !this.state.values
            ? <Spinner />
            : this.renderIfValuesLoaded();
    }
}