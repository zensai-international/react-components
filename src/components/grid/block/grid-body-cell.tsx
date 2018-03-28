import * as React from 'react';
import { GridBodyCell as GridBodyCellBase, GridBodyCellProps } from '../grid-body-cell';
import { ObjectHelper } from '../../../infrastructure/helpers/object-helper';

export class GridBodyCell<P extends GridBodyCellProps = GridBodyCellProps, S = {}> extends GridBodyCellBase<P, S> {
    public render(): JSX.Element {
        const className = this.style.className;
        const content = this.renderContent();
        const title = ObjectHelper.isString(content) ? content : '';

        return (
            <div className={className} onClick={this.handleClick} title={title}>
                {this.renderContent()}
            </div>
        );
    }
}