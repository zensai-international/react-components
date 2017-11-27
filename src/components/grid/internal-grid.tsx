import * as React from 'react';
import { GridProps, GridStyle } from './grid-base';
import { GridBody, GridBodyProps } from './grid-body';
import { GridColumn, GridColumnProps } from './grid-column-base';
import { GridHeader, GridHeaderProps } from './grid-header';

export interface InternalGridProps extends GridProps {
    columns: GridColumn<GridColumnProps>[];
    expandedModels: any[];
    style: GridStyle;
}

export abstract class InternalGrid<P extends InternalGridProps> extends React.Component<P, any> {
    protected renderHeader(): JSX.Element {
        const Header = this.headerType;
        const headerStyle = this.props.style.header;

        return <Header {...this.props} style={headerStyle} />;
    }

    protected renderBody(): JSX.Element {
        const Body = this.bodyType;
        const bodyStyle = this.props.style.body;

        return <Body {...this.props} messages={this.props.messages} style={bodyStyle} />;
    }

    protected abstract get bodyType(): { new (): GridBody<GridBodyProps, any> };

    protected abstract get headerType(): { new (): GridHeader<GridHeaderProps, any> };
}