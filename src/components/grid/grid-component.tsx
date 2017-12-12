import * as React from 'react';
import { GridState } from './grid';
import { DataSource } from '../../infrastructure/data/data-source';
import { GridMessages } from '../../index';

export class GridComponent<P, S> extends React.Component<P, S> {
    public static contextTypes = {
        dataSource: React.PropTypes.object,
        gridState: React.PropTypes.object,
        messages:  React.PropTypes.object
    };

    public context: {
        dataSource: DataSource;
        gridState: GridState;
        messages: GridMessages;
    };
}