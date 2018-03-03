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

            if (result instanceof Array) {
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

            if ((item[field] == null) && ((fields.length - 1) != i)) {
                item[field] = {};
            }

            item = item[field];
        }

        item[fields[fields.length - 1]] = value;
    }
}