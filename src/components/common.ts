import { CssClassNameBuilder } from '../infrastructure/css-class-name-builder';

export interface Style {
    className?: string;
}

export class StyleHelper {
    public static concat(x: Style, y: Style) {
        const className = new CssClassNameBuilder()
            .add(x.className)
            .add(y.className)
            .build();

        return {
            className: className
        };
    }
}