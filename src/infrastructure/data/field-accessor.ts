const FieldSeparator = '.';

export interface FieldAccessor {
    getValue(item: any, compositeField: string): any;
    setValue(item: any, compositeField: string, value: any);
}

export class DefaultFieldAccessor {
    public getValue(item: any, compositeField: string): any {
        const fields = compositeField.split(FieldSeparator);
        let result = item;

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            if ((result instanceof Array) && !result.hasOwnProperty(field)) {
                result = result.map(x => x[field]);
            } else {
                result = result[field];
            }

            if (!result) break;
        }

        return result;
    }

    public setValue(item: any, compositeField: string, value: any) {
        const fields = compositeField.split(FieldSeparator);

        for (let i = 0; i < (fields.length - 1); i++) {
            const field = fields[i];

            item = item[field];
        }

        item[fields[fields.length - 1]] = value;
    }
}