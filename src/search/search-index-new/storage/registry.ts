import {
    RegisterableStorage,
    CollectionDefinitions,
    CollectionDefinition,
    IndexDefinition,
} from './types'
import FIELD_TYPES from './fields'

export interface RegistryCollections {
    [collName: string]: CollectionDefinition
}

export interface RegistryCollectionsVersionMap {
    [collVersion: number]: CollectionDefinition[]
}

export default class StorageRegistry implements RegisterableStorage {
    public static createTermsIndex = (fieldName: string) =>
        `_${fieldName}_terms`

    public collections: RegistryCollections = {}
    public collectionsByVersion: RegistryCollectionsVersionMap = {}

    registerCollection(name: string, defs: CollectionDefinitions) {
        if (!(defs instanceof Array)) {
            defs = [defs]
        }

        defs.sort(def => def.version.getTime()).forEach(def => {
            this.collections[name] = def
            def.name = name

            const fields = def.fields
            Object.entries(fields).forEach(([fieldName, fieldDef]) => {
                const FieldClass = FIELD_TYPES[fieldDef.type]
                if (FieldClass) {
                    fieldDef.fieldObject = new FieldClass(fieldDef)
                }
            })

            const version = def.version.getTime()
            this.collectionsByVersion[version] =
                this.collectionsByVersion[version] || []
            this.collectionsByVersion[version].push(def)
        })
    }
}
