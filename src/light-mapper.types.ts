export type MapperCallBack = (value: any) => void;

export interface IAssocFunction {
    [key: string]: MapperCallBack
};

export interface IAssocAny {
    [key: string]: any
};
