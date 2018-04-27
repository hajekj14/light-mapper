import 'reflect-metadata'
import { IAssocFunction, IAssocAny, MapperCallBack } from './light-mapper.types'
import { MappingMetadata, MappingRequirement } from './light-mapper.decorators'
import * as _ from 'lodash'

enum MAPPER_EXCEPTIONS {
    MISSING_REQUIRED_MEMBER = "Missing required property '{prop}'",
    REQUIRED_BUT_EXCLUDED = "Property '{prop}' excluded but is requered"
}

enum MappingOptsProps {
    REQUIREMENT = 'requirement',
    FROM = 'from',
    TRANSFORMATION = 'transformation'
}

const PROP_PLACEHOLDER = '{prop}'

export class LightMapperRunner {
    private transfromations: IAssocFunction = {}
    private replacements: IAssocAny = {}

    public transform(
        prop: string,
        transformator: MapperCallBack
    ): LightMapperRunner {
        this.transfromations[prop] = transformator
        return this
    }

    public replace(prop: string, value: any) {
        this.replacements[prop] = value
        return this
    }

    public map<T>(
        target: new () => T,
        source: IAssocAny,
        exclude?: string[]
    ): T {
        const obj: T = new target()
        const metadata = Reflect.getMetadata(
            MappingMetadata.MAPPER_PROPS_METADATA,
            obj.constructor
        )
        Object.keys(metadata).forEach(prop => {
            const propOptions = metadata[prop]
            if (exclude && this.isExcluded(exclude, prop, propOptions)) {
                return
            }
            this.setProperty(prop, propOptions, source, obj)
        })
        return obj
    }

    private isExcluded(
        exclude: string[],
        prop: string,
        propOptions: any
    ): boolean {
        if (exclude && exclude.indexOf(prop) > -1) {
            if (
                propOptions.hasOwnProperty(MappingOptsProps.REQUIREMENT) &&
                propOptions.requirement === MappingRequirement.REQUIRED
            ) {
                throw new Error(
                    MAPPER_EXCEPTIONS.REQUIRED_BUT_EXCLUDED.replace(
                        PROP_PLACEHOLDER,
                        prop
                    )
                )
            }
            if (propOptions === MappingRequirement.REQUIRED) {
                throw new Error(
                    MAPPER_EXCEPTIONS.REQUIRED_BUT_EXCLUDED.replace(
                        PROP_PLACEHOLDER,
                        prop
                    )
                )
            }
            return true
        }
        return false
    }

    private getSourceProp(
        source: IAssocAny,
        targetProp: string,
        from: string | string[]
    ): string {
        if (_.isArray(from)) {
            for (const prop of from) {
                if (source.hasOwnProperty(prop)) {
                    return prop
                }
            }
            return targetProp
        }
        return from as string
    }

    private doTransformation(
        prop: string,
        value: any,
        propTransformator: MapperCallBack
    ): any {
        if (propTransformator) {
            value = propTransformator(value)
        }
        if (this.transfromations[prop]) {
            return this.transfromations[prop](value)
        }
        return value
    }

    private setProperty(
        prop: string,
        propOptions: any,
        source: IAssocAny,
        obj: any
    ): void {
        const requirement = propOptions.hasOwnProperty(
            MappingOptsProps.REQUIREMENT
        )
            ? propOptions.requirement
            : propOptions
        const from = propOptions.hasOwnProperty(MappingOptsProps.FROM)
            ? propOptions.from
            : undefined
        const propTransformator = propOptions.hasOwnProperty(
            MappingOptsProps.TRANSFORMATION
        )
            ? propOptions.transformation
            : undefined
        if (this.replacements[prop]) {
            obj[prop] = this.replacements[prop]
            return
        }
        switch (requirement) {
            case MappingRequirement.REQUIRED: {
                this.setRequired(obj, source, prop, from, propTransformator)
                break
            }
            case MappingRequirement.OPTIONAL: {
                this.setOptional(obj, source, prop, from, propTransformator)
                break
            }
            case MappingRequirement.NULLABLE: {
                this.setNullable(obj, source, prop, from, propTransformator)
                break
            }
        }
    }

    private setRequired(
        obj: any,
        source: IAssocAny,
        targetProp: string,
        from: string | string[],
        propTransformator: MapperCallBack
    ): void {
        const sourceProp = from
            ? this.getSourceProp(source, targetProp, from)
            : targetProp
        if (source.hasOwnProperty(sourceProp)) {
            obj[targetProp] = this.doTransformation(
                targetProp,
                source[sourceProp],
                propTransformator
            )
            return
        }
        throw new Error(
            MAPPER_EXCEPTIONS.MISSING_REQUIRED_MEMBER.replace(
                PROP_PLACEHOLDER,
                sourceProp
            )
        )
    }

    private setOptional(
        obj: any,
        source: IAssocAny,
        targetProp: string,
        from: string | string[],
        propTransformator: MapperCallBack
    ): void {
        const sourceProp = from
            ? this.getSourceProp(source, targetProp, from)
            : targetProp
        if (source.hasOwnProperty(sourceProp)) {
            obj[targetProp] = this.doTransformation(
                targetProp,
                source[sourceProp],
                propTransformator
            )
            return
        }
    }

    private setNullable(
        obj: any,
        source: IAssocAny,
        targetProp: string,
        from: string | string[],
        propTransformator: MapperCallBack
    ): void {
        const sourceProp = from
            ? this.getSourceProp(source, targetProp, from)
            : targetProp
        if (source.hasOwnProperty(sourceProp)) {
            obj[targetProp] = this.doTransformation(
                targetProp,
                source[sourceProp],
                propTransformator
            )
            return
        } else {
            obj[targetProp] = null
        }
    }
}
