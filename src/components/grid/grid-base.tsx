import * as React from 'react';
import { GridBodyStyle } from './grid-body';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { GridHeaderStyle } from './grid-header';
import { InternalGrid, InternalGridProps } from './internal-grid';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../../src/infrastructure/data/data-source';
import { EventsStore } from "../../infrastructure/event-store";

export interface GridMessages {
    loading: string;
    noItems: string;
}

export interface GridProps {
    autoBind?: boolean;
    dataSource: DataSource<any>;
    messages?: GridMessages;
    style?: GridStyle;
    eventsStore?: EventsStore;
}

export interface GridState {
    expandedModels?: any[];
}

export interface GridStyle extends Style {
    body: GridBodyStyle;
    header: GridHeaderStyle;
}

export abstract class Grid<P extends GridProps, S extends GridState> extends React.Component<P, S> {
    private _columns: GridColumn<GridColumnProps>[];
    public static defaultProps: Partial<GridProps> = {
        eventsStore: new EventsStore()
    }

    public constructor(props: P) {
        super(props);
        this.state = { expandedModels: [] } as any;
        this.handleDataBound = this.handleDataBound.bind(this);

        this.handleContentExpandedOrCollapsed = this.handleContentExpandedOrCollapsed.bind(this);
        if(this.props.eventsStore){
            this.props.eventsStore.onExpandOrCollapseContent.on(this.handleContentExpandedOrCollapsed);
        }
    }

    protected handleContentExpandedOrCollapsed(_: any, model: any) {
        const models = this.state.expandedModels || [];
        let index = models.indexOf(model);
        if (index != -1) {
            models.splice(index, 1);
        } else {
            models.push(model);
        }
        this.setState({ expandedModels: models });
    }

    protected handleDetailRowCollapsed(_: any, model: any) {
        const models = this.state.expandedModels 
        let index = models.indexOf(model);
        if (index != -1) {
            models.splice(index, 1);
        }
        this.setState({expandedModels: models})
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
        return <InternalGrid eventsStore={this.props.eventsStore} columns={this.columns} 
                             expandedModels={this.state.expandedModels} messages={this.messages} style={this.style} {...this.props}  />
    }

    protected abstract get internalGridType(): { new (): InternalGrid<InternalGridProps> }

    protected get messages(): GridMessages {
        return this.props.messages || {
            loading: '',
            noItems: ''
        };
    }

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