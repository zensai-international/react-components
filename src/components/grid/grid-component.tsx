import * as React from 'react';
import { GridState } from './grid';
import { DataSource } from '../../infrastructure/data/data-source';

export class GridComponent<P, S> extends React.Component<P, S> {
    public static contextTypes = {
        dataSource: React.PropTypes.object,
        gridState: React.PropTypes.object
    };

    public context: {
        dataSource: DataSource;
        gridState: GridState;
    };
}