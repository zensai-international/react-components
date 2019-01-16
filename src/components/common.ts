import { CssClassNameBuilder } from '../infrastructure/css-class-name-builder';

export interface Style {
    className?: string;
}

export class StyleHelper {
    public static concat(x: Style, y: Style) {
        if ((x == null) || (y == null)) {
            return x || y;
        }

        const className = new CssClassNameBuilder()
            .add(x.className)
            .add(y.className)
            .build();
        const result = {
            className,
        };

        for (const propertyName in x) {
            if ((x[propertyName] || y[propertyName]) && (propertyName != 'className')) {
                result[propertyName] = StyleHelper.concat(x[propertyName], y[propertyName]);
            }
        }

        return result;
    }
}