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

    onBodyCellClicked?: (row: GridBodyCell) => void;
    onBodyRowClicked?: (row: GridBodyRow) => void;
    onItemSelected?: (item: any) => void;
    onItemUnselected?: (item: any) => void;
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
        gridState: React.PropTypes.object
    };
    public static defaultProps: Partial<GridProps> = DefultGridProps;

    private _columns: GridColumn<GridColumnProps>[];

    public constructor(props: P) {
        super(props);

        this.state = {
            expandedItems: [],
            selectedItems: []
        } as S;

        this.handleBodyCellClicked = this.handleBodyCellClicked.bind(this);
        this.handleBodyRowClicked = this.handleBodyRowClicked.bind(this);
        this.handleHeaderCellClicked = this.handleHeaderCellClicked.bind(this);
        this.handleHeaderRowClicked = this.handleHeaderRowClicked.bind(this);
        this.handleDataBound = this.handleDataBound.bind(this);
    }

    public getChildContext(): any {
        return {
            dataSource: this.props.dataSource,
            gridState: this.state
        };
    }

    protected handleBodyCellClicked(cell: GridBodyCell) {
        const item = cell.props.item;

        if (cell.props.column instanceof GridExpanderColumn) {
            this.changeItemExpansion(item);
        }

        if (this.props.onBodyCellClicked) {
            this.props.onBodyCellClicked(cell);
        }
    }

    protected handleBodyRowClicked(row: GridBodyRow) {
        this.changeItemSelection(row.props.item);

        if (this.props.onBodyRowClicked) {
            this.props.onBodyRowClicked(row);
        }
    }

    protected handleHeaderCellClicked(cell: any) {
    }

    protected handleHeaderRowClicked() {
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
                onCellClicked={this.handleHeaderCellClicked}
                onRowClicked={this.handleHeaderRowClicked}
                style={headerStyle} />
        );
    }

    protected renderBody(): JSX.Element {
        const Body = this.bodyType;
        const bodyStyle = this.props.style.body;

        return (
            <Body {...this.props}
                columns={this.columns}
                messages={this.props.messages}
                onCellClicked={this.handleBodyCellClicked}
                onRowClicked={this.handleBodyRowClicked}
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

                if (this.props.onItemUnselected) {
                    this.props.onItemUnselected(item);
                }
            } else {
                if ((this.props.selectionMode == GridSelectionMode.Single) && (selectedItems.length == 1)) {
                    selectedItems.splice(0, 1);
                }

                selectedItems.push(item);

                this.setState({ selectedItems: selectedItems });

                if (this.props.onItemSelected) {
                    this.props.onItemSelected(item);
                }
            }
        }
    }

    protected setDataSource(dataSource: DataSource) {
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

    protected abstract get bodyType(): { new (): GridBody<GridBodyProps, any> };
    
    protected abstract get headerType(): { new (): GridHeader<GridHeaderProps, any> };

    public get columns(): GridColumn<GridColumnProps>[] {
        return this._columns = this._columns
            || React.Children.toArray(this.props.children)
                .map(x => new (x as any).type((x as any).props))
                .filter(x => x instanceof GridColumn) as any;
    }
}