import * as React from 'react';
import { GridBody, GridBodyProps } from './grid-body';
import { GridHeader, GridHeaderProps } from './grid-header';
import { Grid as GridBase, GridProps, GridState } from '../grid';

export class Grid<P extends GridProps = GridProps, S extends GridState = GridState> extends GridBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <div {...attributes}>
                {this.renderHeader()}
                {this.renderBody()}
            </div>
        );
    }

    protected get bodyType(): { new (props: GridBodyProps): GridBody } {
        return GridBody;
    }

    protected get headerType(): { new (props: GridHeaderProps): GridHeader } {
        return GridHeader;
    }
}

export * from '../grid';