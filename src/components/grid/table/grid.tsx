import * as React from 'react';
import { GridBody, GridBodyProps } from './grid-body';
import { GridFooter, GridFooterProps } from './grid-footer';
import { GridHeader, GridHeaderProps } from './grid-header';
import { Grid as GridBase, GridState } from '../grid';
import { GridProps } from '../grid.types';

export class Grid<P extends GridProps = GridProps, S extends GridState = GridState> extends GridBase<P, S> {
    public render(): JSX.Element {
        const attributes = this.getAttributes();

        return (
            <table {...attributes}>
                {this.renderHeader()}
                {this.renderBody()}
                {this.renderFooter()}
            </table>
        );
    }

    protected get bodyType(): { new (props: GridBodyProps): GridBody } {
        return GridBody;
    }

    protected get footerType(): { new (props: GridFooterProps): GridFooter } {
        return GridFooter;
    }

    protected get headerType(): { new (props: GridHeaderProps): GridHeader } {
        return GridHeader;
    }
}

export * from '../grid';