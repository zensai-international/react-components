import * as React from 'react';
import { DefaultGridProps } from './default-grid-pros';
import { GridBody, GridBodyStyle } from './grid-body';
import { GridBodyRow, GridBodyRowTemplate } from './grid-body-row';
import { GridBodyCell } from './grid-body-cell';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridExpander } from './grid-expander';
import { GridExpanderColumn } from './grid-expander-column';
import { GridHeader, GridHeaderStyle } from './grid-header';
import { GridHeaderCell } from './grid-header-cell';
import { GridSelector } from './grid-selector';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';
import { FilterContext } from '../../infrastructure/data/filter-context';
import { ConditionalExpression } from '../../infrastructure/expressions/expression';

export interface GridMessages {
    loading: string;
    noItems: string;
}

export enum GridSelectionMode {
    Single,
    Multiple
}

export interface GridProps {
    autoBind?: boolean;
    bodyRowTemplate?: GridBodyRowTemplate;
    dataSource: DataSource;
    filterContext?: FilterContext;
    messages?: GridMessages;
    selectedItems?: any[];
    selectionMode?: GridSelectionMode;
    showHeader?: boolean;
    style?: GridStyle;

    onDataBound?: (sender: Grid) => void;
    onBodyCellClick?: (event: React.MouseEvent<any>, row: GridBodyCell) => void;
    onBodyRowClick?: (event: React.MouseEvent<any>, row: GridBodyRow) => void;
    onSelect?: (sender: Grid, items: any[]) => void;
    onUnselect?: (sender: Grid, items: any[]) => void;
}

export interface GridState {
    expandedItems?: any[];
    selectedItems?: any[];
}

export interface GridStyle extends Style {
    body: GridBodyStyle;
    header: GridHeaderStyle;
}

export interface GridContext {
    filterContext: FilterContext;
    grid: Grid;
    spinnerType: { new(): React.Component };
}

export abstract class Grid<P extends GridProps = GridProps, S extends GridState = GridState> extends React.Component<P, S> {
    public static childContextTypes = {
        filterContext: React.PropTypes.object,
        grid: React.PropTypes.object,
        spinnerType: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func])
    };
    public static defaultProps: Partial<GridProps> = DefaultGridProps;

    private _columns: GridColumn<GridColumnProps>[];
    private readonly _expander: GridExpander;
    private readonly _filterContext: FilterContext;
    private readonly _selector: GridSelector;

    public constructor(props: P) {
        super(props);

        this._expander = new GridExpander(this);
        this._filterContext = this.props.filterContext || new FilterContext();
        this._selector = new GridSelector(this);

        this.state = {
            expandedItems: [],
            selectedItems: this.props.selectedItems || []
        } as S;

        this.handleBodyCellClick = this.handleBodyCellClick.bind(this);
        this.handleBodyRowClick = this.handleBodyRowClick.bind(this);
        this.handleDataBinding = this.handleDataBinding.bind(this);
        this.handleDataBound = this.handleDataBound.bind(this);
        this.handleFilterContextChange = this.handleFilterContextChange.bind(this);
        this.handleHeaderCellClick = this.handleHeaderCellClick.bind(this);
        this.handleHeaderRowClick = this.handleHeaderRowClick.bind(this);
    }

    public getChildContext(): any {
        return {
            filterContext: this._filterContext,
            grid: this,
            spinnerType: this.spinnerType
        };
    }

    protected handleBodyCellClick(event: React.MouseEvent<any>, cell: GridBodyCell) {
        const item = cell.props.rowProps.item;

        if (cell.props.column instanceof GridExpanderColumn) {
            this.expander.expandOrCollapse(item);

            event.stopPropagation();
        }

        if (this.props.onBodyCellClick) {
            this.props.onBodyCellClick(event, cell);
        }
    }

    protected handleBodyRowClick(event: React.MouseEvent<any>, row: GridBodyRow) {
        if (this.props.onBodyRowClick) {
            this.props.onBodyRowClick(event, row);
        }

        if (!event.isPropagationStopped()) {
            this.selector.selectOrUnselect(row.props.item);
        }
    }

    protected handleDataBinding(dataSource: DataSource) {
        if (dataSource == this.props.dataSource) {
            this.forceUpdate();
        }
    }

    protected handleDataBound(dataSource: DataSource) {
        if (dataSource == this.props.dataSource) {
            const handleDataBound = () => {
                if (this.props.onDataBound) {
                    this.props.onDataBound(this);
                }
            };

            this.forceUpdate(handleDataBound);
        }
    }

    protected handleFilterContextChange(expression: ConditionalExpression) {
        const dataSource = this.props.dataSource;

        dataSource.filter(expression);
        dataSource.dataBind();
    }

    protected handleHeaderCellClick(event: React.MouseEvent<any>, cell: GridHeaderCell) {
    }

    protected handleHeaderRowClick() {
    }

    protected renderHeader(): JSX.Element | JSX.Element[] {
        const Header = this.headerType;
        const headerStyle = this.props.style.header;

        return (this.props.showHeader != false)
            ? (
                <Header
                    columns={this.columns}
                    onCellClick={this.handleHeaderCellClick}
                    onRowClick={this.handleHeaderRowClick}
                    style={headerStyle} />
            )
            : null;
    }

    protected renderBody(): JSX.Element | JSX.Element[] {
        const Body = this.bodyType;
        const bodyStyle = this.props.style.body;

        return (
            <Body
                columns={this.columns}
                onCellClick={this.handleBodyCellClick}
                onRowClick={this.handleBodyRowClick}
                rowTemplate={this.props.bodyRowTemplate}
                style={bodyStyle} />
        );
    }

    protected setDataSource(dataSource: DataSource) {
        if ((this.props.autoBind != false) && (dataSource.state == DataSourceState.Empty)) {
            dataSource.dataBind();
        }

        if (dataSource) {
            dataSource.onDataBinding.on(this.handleDataBinding);
            dataSource.onDataBound.on(this.handleDataBound);
        }
    }

    public componentWillMount() {
        this._filterContext.onChange.on(this.handleFilterContextChange);

        this.setDataSource(this.props.dataSource);
    }

    public componentWillUnmount() {
        const dataSource = this.props.dataSource;

        if (dataSource) {
            dataSource.onDataBinding.off(this.handleDataBinding);
            dataSource.onDataBound.off(this.handleDataBound);
        }

        this._filterContext.onChange.off(this.handleFilterContextChange);
    }

    public componentWillUpdate() {
        this._columns = null;
    }

    public componentWillReceiveProps(nextProps: P) {
        if ((this.props.dataSource != nextProps.dataSource) && (nextProps.dataSource != null)) {
            if (this.props.dataSource) {
                this.props.dataSource.onDataBinding.off(this.handleDataBinding);
                this.props.dataSource.onDataBound.off(this.handleDataBound);
            }

            this.setDataSource(nextProps.dataSource);
        }

        if (this.props.selectedItems != nextProps.selectedItems) {
            this.setState({ selectedItems: nextProps.selectedItems });
        }
    }

    protected abstract get bodyType(): { new(): GridBody };

    protected abstract get headerType(): { new(): GridHeader };

    protected get spinnerType(): { new(): React.Component } | React.SFC {
        return () => <span>{this.messages.loading}</span>;
    }

    public get columns(): GridColumn<GridColumnProps>[] {
        return this._columns = this._columns
            || React.Children.toArray(this.props.children)
                .map(x => new (x as any).type((x as any).props, this.getChildContext()))
                .filter(x => x instanceof GridColumn) as any;
    }

    public get expander(): GridExpander {
        return this._expander;
    }

    public get messages(): GridMessages {
        return this.props.messages;
    }

    public get selector(): GridSelector {
        return this._selector;
    }
}