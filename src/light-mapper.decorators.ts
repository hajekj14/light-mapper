import 'reflect-metadata'

export enum MappingRequirement {
    REQUIRED,
    OPTIONAL,
    NULLABLE
}

export enum MappingMetadata {
    MAPPER_PROPS_METADATA
}

export interface MappingOpts {
    requirement: MappingRequirement
    from?: string | string[]
    transformation?: (value: any) => any
}

export function Mapping(
    prop: MappingRequirement | MappingOpts
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        let metadata = Reflect.getMetadata(
            MappingMetadata.MAPPER_PROPS_METADATA,
            target.constructor
        )
        if (!metadata) {
            metadata = {}
        }
        metadata[propertyKey] = prop
        Reflect.defineMetadata(
            MappingMetadata.MAPPER_PROPS_METADATA,
            metadata,
            target.constructor
        )
    }
}
