import * as React from 'react';
import { GridBodyStyle } from './grid-body';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { GridHeaderStyle } from './grid-header';
import { InternalGrid, InternalGridProps } from './internal-grid';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../../src/infrastructure/data/data-source';

export interface GridProps {
    autoBind?: boolean;
    dataSource: DataSource<any>;
    style?: GridStyle;
}

export interface GridState {
    expandedModels?: any[];
}

export interface GridStyle extends Style {
    body?: GridBodyStyle;
    header?: GridHeaderStyle;
}

export abstract class Grid<P extends GridProps, S extends GridState> extends React.Component<P, S> {
    private _columns: GridColumn<GridColumnProps>[];

    public constructor(props: P) {
        super(props);

        this.state = { expandedModels: [] } as any;

        this.handleDataBound = this.handleDataBound.bind(this);
    }

    protected handleDataBound(dataSource: DataSource<any>) {
        if (dataSource == this.props.dataSource) {
            this.forceUpdate();
        }
    }

    protected setDataSource(dataSource: DataSource<any>) {
        if ((this.props.autoBind != false) && (dataSource.state == DataSourceState.Empty)) {
            dataSource.dataBind();
        }

        if (dataSource) {
            dataSource.onDataBound.on(this.handleDataBound);
        }
    }

    public componentWillMount() {
        this.setDataSource(this.props.dataSource);
    }

    public componentWillUpdate() {
        this._columns = null;
    }

    public componentWillReceiveProps(nextProps: P) {
        if ((this.props.dataSource != nextProps.dataSource) && (nextProps.dataSource != null)) {
            if (this.props.dataSource) {
                this.props.dataSource.onDataBound.off(this.handleDataBound);
            }

            this.setDataSource(nextProps.dataSource);
        }
    }

    public render(): JSX.Element {
        const InternalGrid = this.internalGridType;

        return <InternalGrid {...this.props} columns={this.columns} expandedModels={this.state.expandedModels} style={this.style} />
    }

    protected abstract get internalGridType(): { new (): InternalGrid<InternalGridProps> }

    protected get style(): GridStyle {
        return this.props.style;
    }

    public get columns(): GridColumn<GridColumnProps>[] {
        return this._columns = this._columns
            || React.Children.toArray(this.props.children)
                .map(x => new (x as any).type((x as any).props, this))
                .filter(x => x instanceof GridColumn) as any;
    }
}