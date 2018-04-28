import { GridContext } from './grid';
import { GridCell } from './grid-cell';
import { GridColumn } from './grid-column';
import { GridRow, GridRowProps, GridRowStyle } from './grid-row';
import { Style, StyleHelper } from '../common';

export interface GridBodyRowStyle extends GridRowStyle {
    ifSelected: Style;
}

export type GridBodyRowTemplate = (rowType: { new (props: GridBodyRowProps): GridBodyRow }, rowProps: GridBodyRowProps, gridContext?: GridContext) => React.ReactNode;

export interface GridBodyRowProps extends GridRowProps {
    isExpandable: boolean;
    isExpanded: boolean;
    isSelected: boolean;
    item: any;
    style: GridBodyRowStyle;
}

export abstract class GridBodyRow<P extends GridBodyRowProps = GridBodyRowProps, S = {}> extends GridRow<P, S> {
    protected getCellTypeByColumn(column: GridColumn): { new(): GridCell } {
        return column.props.body ? column.props.body.cellType : null;
    }

    public shouldComponentUpdate(nextProps: P): boolean {
        return (this.props.isExpanded != nextProps.isExpanded)
            || (this.props.isSelected != nextProps.isSelected)
            || (this.props.item != nextProps.item);
    }

    protected get style(): Style {
        return this.props.isSelected
            ? StyleHelper.concat(this.props.style, this.props.style.ifSelected)
            : this.props.style;
    }
}