import * as React from 'react';
import { DefultGridProps } from './default-grid-pros';
import { GridBody, GridBodyProps, GridBodyStyle } from './grid-body';
import { GridBodyRow, GridBodyRowTemplate } from './grid-body-row';
import { GridBodyCell } from './grid-body-cell';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridExpanderColumn } from './grid-expander-column';
import { GridHeader, GridHeaderProps, GridHeaderStyle } from './grid-header';
import { GridHeaderCell } from './grid-header-cell';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../../src/infrastructure/data/data-source';
import { FilterContext } from '../../../src/infrastructure/data/filter-context';
import { ConditionalExpression } from '../../../src/infrastructure/expressions/expression';

export interface GridMessages {
    loading: string;
    noItems: string;
}

export class GridSelector {
    private _grid: Grid;

    public constructor(grid: Grid) {
        this._grid = grid;
    }

    public selectOrUnselect(item: any) {
        const grid = this._grid;
        const gridProps = grid.props;

        if (gridProps.selectionMode != GridSelectionMode.None) {
            const selectedItems = grid.state.selectedItems;
            const itemIndex = selectedItems.indexOf(item);

            if (itemIndex != -1) {
                selectedItems.splice(itemIndex, 1);

                grid.setState({ selectedItems: selectedItems }, () => {
                    if (gridProps.onUnselect) {
                        gridProps.onUnselect(grid, [item]);
                    }
                });
            } else {
                if ((gridProps.selectionMode == GridSelectionMode.Single) && selectedItems.length) {
                    selectedItems.length = 0;
                }

                selectedItems.push(item);

                grid.setState({ selectedItems: selectedItems }, () => {
                    if (gridProps.onSelect) {
                        gridProps.onSelect(grid, [item]);
                    }
                });
            }
        }
    }

    public isAllItemsSelected(): boolean {
        const dataSource = this._grid.props.dataSource;

        if (dataSource.state != DataSourceState.Bound) {
            return false;
        }

        const allItems = dataSource.view.allData || dataSource.view.data;

        return (allItems.length > 0) && (this._grid.state.selectedItems.length == allItems.length);
    }

    public selectAll() {
        const dataSource = this._grid.props.dataSource;

        if (dataSource.state == DataSourceState.Bound) {
            const allItems = (dataSource.view.allData || dataSource.view.data).map(x => x);
            const grid = this._grid;

            grid.setState({ selectedItems: allItems }, () => {
                if (grid.props.onSelect) {
                    grid.props.onSelect(grid, grid.state.selectedItems);
                }
            });
        }
    }

    public selectOrUnselectAll() {
        if (this.isAllItemsSelected()) {
            this.unselectAll();
        } else {
            this.selectAll();
        }
    }

    public unselectAll() {
        const grid = this._grid;

        if (grid.state.selectedItems.length != 0) {
            grid.setState({ selectedItems: [] }, () => {
                if (grid.props.onUnselect) {
                    grid.props.onUnselect(grid, grid.state.selectedItems);
                }
            });
        }
    }
}

export enum GridSelectionMode {
    None,
    Single,
    Multiple
}

export interface GridProps {
    autoBind?: boolean;
    bodyRowTemplate?: GridBodyRowTemplate;
    dataSource: DataSource;
    messages?: GridMessages;
    selectedItems?: any[];
    selectionMode?: GridSelectionMode;
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

export abstract class Grid<P extends GridProps = GridProps, S extends GridState = GridState> extends React.Component<P, S> {
    public static childContextTypes = {
        grid: React.PropTypes.object
    };
    public static defaultProps: Partial<GridProps> = DefultGridProps;

    private _columns: GridColumn<GridColumnProps>[];
    private _filterContext: FilterContext;
    private _selector: GridSelector;

    public constructor(props: P) {
        super(props);

        this._filterContext = new FilterContext();
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
            grid: this
        };
    }

    protected handleBodyCellClick(event: React.MouseEvent<any>, cell: GridBodyCell) {
        const item = cell.props.item;

        if (cell.props.column instanceof GridExpanderColumn) {
            this.changeItemExpansion(item);
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
            const data = dataSource.view.data;
            const expandedItems = this.state.expandedItems.filter(x => data.indexOf(x) != -1);
            // const selection = this.state.selection;
            // const selectedItems = selection.selectedItems.filter(x => data.indexOf(x) != -1);
            // const unselectedItems = selection.unselectedItems.filter(x => data.indexOf(x) != -1);
            const handleDataBound = () => {
                if (this.props.onDataBound) {
                    this.props.onDataBound(this);
                }
            };

            if ((expandedItems.length != this.state.expandedItems.length)/*
                || (selectedItems && (selectedItems.length != selection.selectedItems.length))
                || (unselectedItems && (unselectedItems.length != selection.unselectedItems.length))*/) {
                this.setState({
                    expandedItems: expandedItems,
                    // selection: {
                    //     selectedItems: selectedItems,
                    //     unselectedItems: unselectedItems
                    // }
                    },
                    handleDataBound);
            } else {
                this.forceUpdate(handleDataBound);
            }
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

    protected renderHeader(): JSX.Element {
        const Header = this.headerType;
        const headerStyle = this.props.style.header;

        return (
            <Header {...this.props}
                columns={this.columns}
                onCellClick={this.handleHeaderCellClick}
                onRowClick={this.handleHeaderRowClick}
                style={headerStyle} />
        );
    }

    protected renderBody(): JSX.Element {
        const Body = this.bodyType;
        const bodyStyle = this.props.style.body;

        return (
            <Body {...this.props}
                columns={this.columns}
                onCellClick={this.handleBodyCellClick}
                onRowClick={this.handleBodyRowClick}
                rowTemplate={this.props.bodyRowTemplate}
                style={bodyStyle} />
        );
    }

    protected changeItemExpansion(item: any) {
        const index = this.state.expandedItems.indexOf(item);
        const expandedItems = this.state.expandedItems;

        if (index != -1) {
            expandedItems.splice(index, 1);
        } else {
            expandedItems.push(item);
        }

        this.setState({ expandedItems });
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
        this.filterContext.onChange.on(this.handleFilterContextChange);

        this.setDataSource(this.props.dataSource);
    }

    public componentWillUnmount() {
        const dataSource = this.props.dataSource;

        if (dataSource) {
            dataSource.onDataBinding.off(this.handleDataBinding);
            dataSource.onDataBound.off(this.handleDataBound);
        }

        this.filterContext.onChange.off(this.handleFilterContextChange);
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
    }

    protected abstract get bodyType(): { new(): GridBody<GridBodyProps, any> };

    protected abstract get headerType(): { new(): GridHeader<GridHeaderProps, any> };

    public get columns(): GridColumn<GridColumnProps>[] {
        return this._columns = this._columns
            || React.Children.toArray(this.props.children)
                .map(x => new (x as any).type((x as any).props, this.getChildContext()))
                .filter(x => x instanceof GridColumn) as any;
    }

    public get filterContext(): FilterContext {
        return this._filterContext;
    }

    public get messages(): GridMessages {
        return this.props.messages;
    }

    public get selector(): GridSelector {
        return this._selector;
    }
}