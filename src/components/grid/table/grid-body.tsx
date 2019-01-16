import * as React from 'react';
import { GridBody as GridBodyBase, GridBodyProps } from '../grid-body';
import { GridBodyRow, GridBodyRowProps } from './grid-body-row';

export class GridBody<P extends GridBodyProps = GridBodyProps, S = {}> extends GridBodyBase<P, S> {
    protected renderMessageRow(messageContent: React.ReactNode): React.ReactNode {
        const className = this.props.style.row.className;

        return (
            <tr className={className}>
                <td colSpan={this.props.columns.length}>{messageContent}</td>
            </tr>
        );
    }

    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <tbody {...attributes}>
                {this.renderRows()}
            </tbody>
        );
    }

    protected get rowType(): { new (props: GridBodyRowProps): GridBodyRow } {
        return GridBodyRow;
    }
}

export * from '../grid-body';