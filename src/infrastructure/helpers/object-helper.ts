export class ObjectHelper {
    public static create(fields: string[], values: any[]) {
        const result = {};

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];

            result[field] = values[i];
        }

        return result;
    }

    public static isFunction(object: any) {
        return typeof object == 'function';
    }

    public static isString(object: any) {
        return typeof object == 'string';
    }
}