import * as React from 'react';
import { DefultGridProps } from './default-grid-pros';
import { GridBody, GridBodyProps, GridBodyStyle } from './grid-body';
import { GridBodyRow, GridBodyRowTemplate } from './grid-body-row';
import { GridBodyCell } from './grid-body-cell';
import { GridColumn, GridColumnProps } from './grid-column';
import { GridExpanderColumn } from './grid-expander-column';
import { GridHeader, GridHeaderProps, GridHeaderStyle } from './grid-header';
import { Style } from '../common';
import { DataSource, DataSourceState } from '../../../src/infrastructure/data/data-source';

export interface GridMessages {
    loading: string;
    noItems: string;
}

export enum GridSelectionMode {
    None,
    Single,
    Multi
}

export interface GridProps {
    autoBind?: boolean;
    bodyRowTemplate?: GridBodyRowTemplate;
    dataSource: DataSource;
    messages?: GridMessages;
    selectionMode?: GridSelectionMode;
    style?: GridStyle;

    onBodyCellClick?: (row: GridBodyCell) => void;
    onBodyRowClick?: (row: GridBodyRow) => void;
    onItemSelect?: (item: any) => void;
    onItemUnselect?: (item: any) => void;
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
        dataSource: React.PropTypes.object,
        gridState: React.PropTypes.object,
        messages: React.PropTypes.object
    };
    public static defaultProps: Partial<GridProps> = DefultGridProps;

    private _columns: GridColumn<GridColumnProps>[];

    public constructor(props: P) {
        super(props);

        this.state = {
            expandedItems: [],
            selectedItems: []
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
            dataSource: this.props.dataSource,
            gridState: this.state,
            messages: this.messages
        };
    }

    protected handleBodyCellClick(cell: GridBodyCell) {
        const item = cell.props.item;

        if (cell.props.column instanceof GridExpanderColumn) {
            this.changeItemExpansion(item);
        }

        if (this.props.onBodyCellClick) {
            this.props.onBodyCellClick(cell);
        }
    }

    protected handleBodyRowClick(row: GridBodyRow) {
        this.changeItemSelection(row.props.item);

        if (this.props.onBodyRowClick) {
            this.props.onBodyRowClick(row);
        }
    }

    protected handleHeaderCellClick(cell: any) {
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
            this.forceUpdate();
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
            const itemIndex = this.state.selectedItems.indexOf(item);
            const selectedItems = this.state.selectedItems;

            if (itemIndex != -1) {
                selectedItems.splice(itemIndex, 1);

                this.setState({ selectedItems: selectedItems });

                if (this.props.onItemUnselect) {
                    this.props.onItemUnselect(item);
                }
            } else {
                if ((this.props.selectionMode == GridSelectionMode.Single) && (selectedItems.length == 1)) {
                    selectedItems.splice(0, 1);
                }

                selectedItems.push(item);

                this.setState({ selectedItems: selectedItems });

                if (this.props.onItemSelect) {
                    this.props.onItemSelect(item);
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

    protected abstract get bodyType(): { new (): GridBody<GridBodyProps, any> };

    protected abstract get headerType(): { new (): GridHeader<GridHeaderProps, any> };

    protected get messages(): GridMessages {
        return this.props.messages;
    }

    public get columns(): GridColumn<GridColumnProps>[] {
        return this._columns = this._columns
            || React.Children.toArray(this.props.children)
                .map(x => new (x as any).type((x as any).props))
                .filter(x => x instanceof GridColumn) as any;
    }
}