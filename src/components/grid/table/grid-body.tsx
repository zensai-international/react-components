import * as React from 'react';
import { GridBodyRow } from './grid-body-row';
import { GridBody as GridBodyBase, GridBodyProps } from '../grid-body';

export class GridBody<P extends GridBodyProps = GridBodyProps, S = any> extends GridBodyBase<P, S> {
    protected renderMessageRow(messageContent: JSX.Element | string): JSX.Element {
        const className = this.props.style.row.className;

        return (
            <tr className={className}>
                <td colSpan={this.props.columns.length}>{messageContent}</td>
            </tr>
        );
    }

    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <tbody className={className}>
                {this.renderRows()}
            </tbody>
        );
    }

    protected get rowType(): { new (): GridBodyRow } {
        return GridBodyRow as any;
    }
}