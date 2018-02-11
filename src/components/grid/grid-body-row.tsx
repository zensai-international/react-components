import { GridCell } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridRow, GridRowProps, GridRowStyle } from './grid-row';
import { Style, StyleHelper } from '../common';

export interface GridBodyRowStyle extends GridRowStyle {
    ifSelected: Style;
}

export type GridBodyRowTemplate = (rowType: { new (): GridBodyRow }, rowProps: GridBodyRowProps) => JSX.Element | JSX.Element[];

export interface GridBodyRowProps extends GridRowProps {
    isExpanded: boolean;
    isSelected: boolean;
    item: any;
    style: GridBodyRowStyle;
}

export abstract class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = any> extends GridRow<P, S> {
    protected getCellTypeByColumn(column: GridColumn): { new(): GridCell } {
        return column.props.body ? column.props.body.cellType : null;
    }

    protected get style(): Style {
        return this.props.isSelected
            ? StyleHelper.concat(this.props.style, this.props.style.ifSelected)
            : this.props.style;
    }
}