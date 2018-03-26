import * as React from 'react';
import { GridContext } from './grid';

export class GridComponent<P, S> extends React.Component<P, S> {
    public static contextTypes = {
        filterContext: React.PropTypes.object,
        grid: React.PropTypes.object,
        spinnerType: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func])
    };

    public context: GridContext;
}