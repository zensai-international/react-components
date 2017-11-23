import * as React from 'react';
import { GridBody } from './grid-body';
import { GridHeader } from './grid-header';
import { InternalGrid as InternalGridBase, InternalGridProps } from '../internal-grid';

export class InternalGrid extends InternalGridBase<InternalGridProps> {
    public render(): JSX.Element {
        const className = this.props.style.className;

        return (
            <table className={className}>
                {this.renderHeader()}
                {this.renderBody()}
            </table>
        );
    }

    protected get bodyType(): { new (): GridBody } {
        return GridBody;
    }

    protected get headerType(): { new (): GridHeader } {
        return GridHeader;
    }
}