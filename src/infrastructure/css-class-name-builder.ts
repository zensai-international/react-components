const ClassNameSeparator: string = ' ';

export class CssClassNameBuilder {
    private _stack: ((x: string) => string)[] = [];

    public add(className: string): CssClassNameBuilder {
        this._stack.push(x => x ? (x + ClassNameSeparator + className) : className);

        return this;
    }

    public addIf(condition: boolean, classNameGetter: () => string): CssClassNameBuilder {
        if (condition) {
            this.add(classNameGetter());
        }

        return this;
    }

    public build(): string {
        let result = null;

        for (let i = 0; i < this._stack.length; i++) {
            result = this._stack[i](result);
        }

        return result;
    }
}