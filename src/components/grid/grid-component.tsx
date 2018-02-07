import * as React from 'react';
import { Grid } from './grid';

export class GridComponent<P, S> extends React.Component<P, S> {
    public static contextTypes = {
        grid: React.PropTypes.object,
    };

    public context: {
        grid: Grid;
    };
}