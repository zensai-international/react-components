import { GridRow, GridRowProps, GridRowStyle } from './grid-row';
import { Style, StyleHelper } from '../common';

export interface GridBodyRowStyle extends GridRowStyle {
    ifSelected: Style;
}

export type GridBodyRowTemplate = (rowType: { new (): GridBodyRow }, rowProps: GridBodyRowProps) => JSX.Element | JSX.Element[];

export interface GridBodyRowProps extends GridRowProps {
    isExpandedItem: boolean;
    isSelectedItem: boolean;
    item: any;
    style: GridBodyRowStyle;
}

export abstract class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = any> extends GridRow<P, S> {
    protected get style(): Style {
        return this.props.isSelectedItem
            ? StyleHelper.concat(this.props.style, this.props.style.ifSelected)
            : this.props.style;
    }
}