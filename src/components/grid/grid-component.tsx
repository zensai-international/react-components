import * as React from 'react';
import { PropTypes } from 'prop-types';
import { GridContext } from './grid';

export const GridContextTypes = {
    filterContext: PropTypes.object,
    grid: PropTypes.object,
    spinnerType: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
};

export class GridComponent<P, S> extends React.Component<P, S> {
    public static contextTypes = GridContextTypes;

    public context: GridContext;
}