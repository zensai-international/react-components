import * as React from 'react';
import { Grid } from './grid';
import { FilterContext } from '../../infrastructure/data/filter-context';

export class GridComponent<P, S> extends React.Component<P, S> {
    public static contextTypes = {
        filterContext: React.PropTypes.object,
        grid: React.PropTypes.object,
        spinnerType: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.func])
    };

    public context: {
        filterContext: FilterContext;
        grid: Grid;
        spinnerType: { new(): React.Component };
    };
}