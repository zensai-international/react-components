const FieldSeparator = '.';

export interface FieldAccessor {
    getValue(model: any, compositeField: string): any;
    setValue(model: any, compositeField: string, value: any);
}

export class DefaultFieldAccessor {
    public getValue(model: any, compositeField: string): any {
        const fields = compositeField.split(FieldSeparator);
        let result = model;

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            if (result instanceof Array) {
                result = result.map(x => x[field]);
            } else {
                result = result[field];
            }

            if (!result) break;
        }

        return result;
    }

    public setValue(model: any, compositeField: string, value: any) {
        const fields = compositeField.split(FieldSeparator);

        for (let i = 0; i < (fields.length - 1); i++) {
            const field = fields[i];
            
            model = model[field];
        }

        model[fields[fields.length - 1]] = value;
    }
}