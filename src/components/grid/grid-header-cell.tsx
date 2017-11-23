import { GridCell, GridCellProps } from './grid-cell';
import { SortDirection } from '../../infrastructure/data/common';
import { DataSource } from '../../infrastructure/data/data-source';

export interface GridHeaderCellProps extends GridCellProps {
    dataSource: DataSource<any>;
}

export abstract class GridHeaderCell<P extends GridHeaderCellProps, S> extends GridCell<P, S> {
    public constructor(props?: P) {
        super(props);

        this.handleSortClicked = this.handleSortClicked.bind(this);
    }

    protected handleSortClicked() {
        const field = this.props.column.props.field;
        const dataSource = this.props.dataSource;
        let sortedBy = null;

        if (dataSource.view && dataSource.view.sortedBy) {
            sortedBy = dataSource.view.sortedBy.filter(x => x.field == field);
            sortedBy = (sortedBy.length == 1) ? sortedBy[0] : null;
        }

        const direction = (sortedBy != null)
            ? ((sortedBy.direction == SortDirection.Ascending) ? SortDirection.Descending : null)
            : SortDirection.Ascending;

        if (direction) {
            dataSource.sort({ direction: direction, field: field });
        } else {
            dataSource.sort();
        }

        dataSource.dataBind();
    }

    protected getSortDirection(): SortDirection {
        const field = this.props.column.props.field;
        const dataSource = this.props.dataSource;
        const sortedBy = (this.props.dataSource.view && dataSource.view.sortedBy)
            ? dataSource.view.sortedBy.filter(x => x.field == field)
            : null;

        return (sortedBy != null)
                && (sortedBy.length == 1)
                && (sortedBy[0].field == field)
            ? sortedBy[0].direction
            : null;
    }
}