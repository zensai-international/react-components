import { GridBodyRowTemplate } from './grid-body-row';
import { DataSource } from '../../infrastructure/data/data-source';
import { FilterContext } from '../../infrastructure/data/filter-context';
import { Grid } from './grid';
import { Style } from '../common';
import { GridFooterStyle } from './grid-footer';
import { GridHeaderStyle } from './grid-header';
import { GridBodyStyle } from './grid-body';
import { GridBodyCell } from './grid-body-cell';
import { GridBodyRow } from './grid-body-row';

export interface GridProps {
    /**
     *
     */
    autoBind?: boolean;

    /**
     *
     */
    filterContext?: FilterContext;

    /**
     *
     */
    dataSource: DataSource;

    /**
     * Optional custom renderer for body row part
     */
    bodyRowTemplate?: GridBodyRowTemplate;

    /**
     * Manually sets the messages on grid actions
     */
    messages?: GridMessages;

    /**
     *  Select grid items on render
     */
    selectedItems?: any[];

    /**
     *  To set the grid selection mode
     *  Use it with <GridSelectorColumn /> component
     */
    selectionMode?: GridSelectionMode;

    /**
     * If false will not render the grid header part
     * @default true
     */
    showHeader?: boolean;

    /**
     * Styling
     * Set `EfGridStyle` for render latest layout for grid
     * @default EfGridStyle in `<GridView />` component
     */
    style?: GridStyle;

    /**
     * Callback that is called when ... ?
     */
    onDataBound?: (sender: Grid) => void;

    /**
     * Callback that is called when click on body cell item.
     */
    onBodyCellClick?: (event: React.MouseEvent<any>, row: GridBodyCell) => void;

    /**
     * Callback that is called when click on body row item.
     */
    onBodyRowClick?: (event: React.MouseEvent<any>, row: GridBodyRow) => void;

    /**
     * Callback that is called when select grid item in selection mode.
     */
    onSelect?: (sender: Grid, items: any[]) => void;

    /**
     * Callback that is called when unselect grid item selection mode.
     */
    onUnselect?: (sender: Grid, items: any[]) => void;
}

export interface GridMessages {
    loading: string;
    noItems: string;
}

export enum GridSelectionMode {
    Single,
    Multiple
}

export interface GridStyle extends Style {
    body: GridBodyStyle;
    footer: GridFooterStyle;
    header: GridHeaderStyle;
}
