import { DataType } from './data/common';

export interface TypeConverter<T> {
    convert(value: any): T;
}

export class DefaultConverter implements TypeConverter<Date> {
    public static readonly instance: DefaultConverter = new DefaultConverter();

    public convert(value: any): Date {
        return value;
    }
}

export class DateConverter implements TypeConverter<Date> {
    public convert(value: any): Date {
        return value ? new Date(value) : null;
    }
}

export class TypeConverterProvider {
    public static readonly instance: TypeConverterProvider = new TypeConverterProvider();

    private _converters: { [dataType: string]: TypeConverter<any> } = {
        [DataType[DataType.Date]]: new DateConverter()
    };

    public get(dataType: DataType): TypeConverter<any> {
        return this._converters[DataType[dataType]] || DefaultConverter.instance;
    }
}