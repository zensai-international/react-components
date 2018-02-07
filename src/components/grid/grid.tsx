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

export interface GridMessages {
    loading: string;
    noItems: string;
}

export interface GridSelection {
    selectedItems?: any[];
    unselectedItems?: any[];
}

export const GridSelection = {
    SelectedAll: () => {
        return {
            selectedItems: null,
            unselectedItems: []
        };
    },

    UnselectedAll: () => {
        return {
            selectedItems: [],
            unselectedItems: null
        };
    },

    isAllSelected: (selection: GridSelection) => {
        return (selection.unselectedItems != null) && (selection.unselectedItems.length > 0);
    },

    isSelected: (selection: GridSelection, item: any) => {
        return ((selection.selectedItems != null) && (selection.selectedItems.indexOf(item) != -1))
            || ((selection.unselectedItems != null) && (selection.unselectedItems.indexOf(item) == -1));
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
    selection?: GridSelection;
    selectionMode?: GridSelectionMode;
    style?: GridStyle;

    onDataBound?: (grid: Grid) => void;
    onBodyCellClick?: (event: React.MouseEvent<any>, row: GridBodyCell) => void;
    onBodyRowClick?: (event: React.MouseEvent<any>, row: GridBodyRow) => void;
    onItemSelect?: (item: any) => void;
    onItemUnselect?: (item: any) => void;
}

export interface GridState {
    expandedItems?: any[];
    selection?: GridSelection;
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

    public constructor(props: P) {
        super(props);

        this.state = {
            expandedItems: [],
            selection: this.props.selection
                || ((this.props.selectionMode != GridSelectionMode.None) ? GridSelection.UnselectedAll() : null)
        } as S;

        this.handleBodyCellClick = this.handleBodyCellClick.bind(this);
        this.handleBodyRowClick = this.handleBodyRowClick.bind(this);
        this.handleHeaderCellClick = this.handleHeaderCellClick.bind(this);
        this.handleHeaderRowClick = this.handleHeaderRowClick.bind(this);
        this.handleDataBinding = this.handleDataBinding.bind(this);
        this.handleDataBound = this.handleDataBound.bind(this);
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
            this.changeItemSelection(row.props.item);
        }
    }

    protected handleHeaderCellClick(event: React.MouseEvent<any>, cell: GridHeaderCell) {
    }

    protected handleHeaderRowClick() {
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

    protected changeItemSelection(item: any) {
        if (this.props.selectionMode != GridSelectionMode.None) {
            const selection = this.state.selection;
            const items = selection.selectedItems || selection.unselectedItems;
            const itemIndex = items.indexOf(item);

            if (itemIndex != -1) {
                const event = selection.selectedItems ? this.props.onItemUnselect : this.props.onItemSelect;

                items.splice(itemIndex, 1);

                this.setState({ selection: selection });

                if (event) {
                    event(item);
                }
            } else {
                const event = selection.unselectedItems ? this.props.onItemUnselect : this.props.onItemSelect;

                if ((this.props.selectionMode == GridSelectionMode.Single) && items.length) {
                    items.length = 0;
                }

                items.push(item);

                this.setState({ selection: selection });

                if (event) {
                    event(item);
                }
            }
        }
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
        this.setDataSource(this.props.dataSource);
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

    protected get messages(): GridMessages {
        return this.props.messages;
    }

    public get columns(): GridColumn<GridColumnProps>[] {
        return this._columns = this._columns
            || React.Children.toArray(this.props.children)
                .map(x => new (x as any).type((x as any).props, this.getChildContext()))
                .filter(x => x instanceof GridColumn) as any;
    }
}