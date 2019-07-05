import * as React from 'react';
import { PropTypes } from 'prop-types';
import { DefaultGridProps } from './default-grid-pros';
import { GridBody, GridBodyProps, GridBodyStyle } from './grid-body';
import { GridBodyCell, GridBodyCellProps } from './grid-body-cell';
import { GridBodyRow, GridBodyRowTemplate, GridBodyRowProps } from './grid-body-row';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridExpander } from './grid-expander';
import { GridExpanderColumn } from './grid-expander-column';
import { GridFooter, GridFooterProps, GridFooterStyle } from './grid-footer';
import { GridHeader, GridHeaderProps, GridHeaderStyle } from './grid-header';
import { GridHeaderCell, GridHeaderCellProps, GridHeaderCellState } from './grid-header-cell';
import { GridSelector } from './grid-selector';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../infrastructure/data/data-source';
import { DataSourceChange, DataSourceChangeType } from '../../infrastructure/data/data-source-change-tracker';
import { FilterContext } from '../../infrastructure/data/filter-context';
import { ConditionalExpression } from '../../infrastructure/expressions/expression';

export interface GridContext {
    filterContext: FilterContext;
    grid: Grid;
    spinnerType: { new (props: any): React.Component } | React.SFC;
}

export const GridContextTypes = {
    filterContext: PropTypes.object,
    grid: PropTypes.object,
    spinnerType: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
};

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
    headerProps?: React.ClassAttributes<GridHeader>;
    bodyProps?: React.ClassAttributes<GridBody>;
    bodyRowTemplate?: GridBodyRowTemplate;
    dataSource: DataSource;
    filterContext?: FilterContext;
    footerProps?: React.ClassAttributes<GridFooter>;
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
    footer: GridFooterStyle;
    header: GridHeaderStyle;
}

export abstract class Grid<
    P extends GridProps = GridProps,
    S extends GridState = GridState
> extends React.Component<P, S> {
    public static childContextTypes = GridContextTypes;
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
    }

    protected getAttributes(): React.HTMLAttributes<{}> {
        const className = this.props.style.className;

        return {
            className: className,
            // 'data-name': key,
            role: 'grid'
        } as any;
    }

    public getChildContext(): GridContext {
        return {
            filterContext: this._filterContext,
            grid: this,
            spinnerType: this.spinnerType
        };
    }

    protected handleBodyCellClick = (event: React.MouseEvent<any>, cell: GridBodyCell<GridBodyCellProps>) => {
        const rowProps = cell.props.rowProps;

        if ((cell.props.column instanceof GridExpanderColumn) && (rowProps.isExpandable != false)) {
            this.expander.expandOrCollapse(rowProps.item);

            event.stopPropagation();
        }

        if (this.props.onBodyCellClick) {
            this.props.onBodyCellClick(event, cell);
        }
    }

    protected handleBodyRowClick = (event: React.MouseEvent<any>, row: GridBodyRow<GridBodyRowProps>) => {
        if (this.props.onBodyRowClick) {
            this.props.onBodyRowClick(event, row);
        }

        if (row.props.isSelectable != false && !event.isPropagationStopped()) {
            this.selector.selectOrUnselect(row.props.item);
        }
    }

    protected handleDataBinding = (dataSource: DataSource) => {
        if (dataSource == this.props.dataSource) {
            this.forceUpdate();
        }
    }

    protected handleDataBound = (dataSource: DataSource) => {
        if (dataSource == this.props.dataSource) {
            const handleDataBound = () => {
                if (this.props.onDataBound) {
                    this.props.onDataBound(this);
                }
            };

            this.forceUpdate(handleDataBound);
        }
    }

    protected handleDataSourceChange = (sender: {}, change: DataSourceChange) => {
        if ((change.type == DataSourceChangeType.Delete) && this.selector.isSelected(change.item)) {
            this.selector.unselect(change.item);
        }
    }

    protected handleFilterContextChange = (expression: ConditionalExpression) => {
        const dataSource = this.props.dataSource;

        dataSource.filter(expression);
        dataSource.dataBind();
    }

    protected handleHeaderCellClick = (event: React.MouseEvent<any>, cell: GridHeaderCell<GridHeaderCellProps, GridHeaderCellState>) => {
    }

    protected handleHeaderRowClick = () => {
    }

    protected renderBody(): React.ReactNode {
        const Body = this.bodyType;
        const { body: bodyStyle } = this.props.style;
        const { bodyProps } = this.props;

        return (
            <Body
                {...bodyProps}
                columns={this.columns}
                onCellClick={this.handleBodyCellClick}
                onRowClick={this.handleBodyRowClick}
                rowTemplate={this.props.bodyRowTemplate}
                style={bodyStyle}
            />
        );
    }

    protected renderFooter(): React.ReactNode {
        const Footer = this.footerType;
        const footerStyle = this.props.style.footer;
        const showFooter = this.columns.some(x => x.props.footer != null);

        return showFooter && (
            <Footer
                columns={this.columns}
                onCellClick={null}
                onRowClick={null}
                style={footerStyle}
            />
        );
    }

    protected renderHeader(): React.ReactNode {
        const Header = this.headerType;
        const headerStyle = this.props.style.header;
        const { headerProps } = this.props;

        return (this.props.showHeader != false) && (
            <Header
                {...headerProps}
                columns={this.columns}
                onCellClick={this.handleHeaderCellClick}
                onRowClick={this.handleHeaderRowClick}
                style={headerStyle}
            />
        );
    }

    protected setDataSource(dataSource: DataSource) {
        if ((this.props.autoBind != false) && (dataSource.state == DataSourceState.Empty)) {
            const filterExpression = this._filterContext.build();

            if (filterExpression) {
                dataSource.filter(filterExpression);
            }

            dataSource.dataBind();
        }

        if (dataSource) {
            dataSource.onDataBinding.on(this.handleDataBinding);
            dataSource.onDataBound.on(this.handleDataBound);

            if (dataSource.changeTracker) {
                dataSource.changeTracker.onChange.on(this.handleDataSourceChange);
            }
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

            if (dataSource.changeTracker) {
                dataSource.changeTracker.onChange.off(this.handleDataSourceChange);
            }
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

    protected abstract get bodyType(): { new (props: GridBodyProps): GridBody };

    protected abstract get footerType(): { new (props: GridFooterProps): GridFooter };

    protected abstract get headerType(): { new (props: GridHeaderProps): GridHeader };

    protected get spinnerType(): { new (props: any): React.Component } | React.SFC {
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