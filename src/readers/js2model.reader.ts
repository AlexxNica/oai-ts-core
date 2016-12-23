/**
 * @license
 * Copyright 2016 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Oas20Document} from "../models/2.0/document.model";
import {Oas20Info} from "../models/2.0/info.model";
import {Oas20Contact} from "../models/2.0/contact.model";
import {Oas20License} from "../models/2.0/license.model";
import {OasExtensibleNode} from "../models/enode.model";
import {Oas20Tag} from "../models/2.0/tag.model";
import {Oas20ExternalDocumentation} from "../models/2.0/external-documentation.model";
import {Oas20SecurityRequirement} from "../models/2.0/security-requirement.model";
import {Oas20SecurityDefinitions} from "../models/2.0/security-definitions.model";
import {Oas20SecurityScheme} from "../models/2.0/security-scheme.model";
import {Oas20Scopes} from "../models/2.0/scopes.model";
import {Oas20PathItem} from "../models/2.0/path-item.model";
import {Oas20Paths} from "../models/2.0/paths.model";
import {Oas20Operation} from "../models/2.0/operation.model";
import {Oas20Parameter, Oas20ParameterDefinition, Oas20ParameterBase} from "../models/2.0/parameter.model";
import {
    Oas20Schema, Oas20AdditionalPropertiesSchema, Oas20PropertySchema,
    Oas20DefinitionSchema, Oas20ItemsSchema, Oas20AllOfSchema
} from "../models/2.0/schema.model";
import {Oas20Items, Oas20ItemsCollectionFormat} from "../models/2.0/items.model";
import {Oas20Responses} from "../models/2.0/responses.model";
import {Oas20Response, Oas20ResponseDefinition, Oas20ResponseBase} from "../models/2.0/response.model";
import {Oas20Headers} from "../models/2.0/headers.model";
import {Oas20Example} from "../models/2.0/example.model";
import {Oas20Header} from "../models/2.0/header.model";
import {Oas20XML} from "../models/2.0/xml.model";
import {Oas20Definitions} from "../models/2.0/definitions.model";
import {Oas20ParametersDefinitions} from "../models/2.0/parameters-definitions.model";
import {Oas20ResponsesDefinitions} from "../models/2.0/responses-definitions.model";
import {JsonSchemaType} from "../models/json-schema";
import {IOas20NodeVisitor} from "../visitors/visitor.iface";
import {OasExtension} from "../models/extension.model";

/**
 * This class reads a javascript object and turns it into a OAS 2.0 model.  It is obviously
 * assumed that the javascript data actually does represent an OAS 2.0 document.
 */
export class Oas20JS2ModelReader {

    /**
     * Returns true if the given thing is defined.
     * @param thing
     * @return {boolean}
     */
    private isDefined(thing: any): boolean {
        if (typeof thing === "undefined" || thing === null) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Converts from String to an JsonSchemaType.
     * @param type
     * @return {JsonSchemaType}
     */
    private toJsonSchemaType(type: string): JsonSchemaType {
        if (type == null) {
            return null;
        }
        return JsonSchemaType[type];
    }

    /**
     * Converts from String to an JsonSchemaType.
     * @param format
     * @return {Oas20ItemsCollectionFormat}
     */
    private toOas20ItemsCollectionFormat(format: string): Oas20ItemsCollectionFormat {
        if (format == null) {
            return null;
        }
        return Oas20ItemsCollectionFormat[format];
    }

    /**
     * Reads the given javascript data and returns an OAS 2.0 document.  Throws an error if
     * the root 'swagger' property is not found or if its value is not "2.0".
     * @param jsData
     */
    public read(jsData: any): Oas20Document {
        let docModel: Oas20Document = new Oas20Document();

        let swagger: string = jsData["swagger"];
        if (swagger != "2.0") {
            throw Error("Unsupported specification version: " + swagger);
        }

        let info: any = jsData["info"];
        let host: string = jsData["host"];
        let basePath: string = jsData["basePath"];
        let schemes: string[] = jsData["schemes"];
        let consumes: string[] = jsData["consumes"];
        let produces: string[] = jsData["produces"];
        let paths: any = jsData["paths"];
        let definitions: any = jsData["definitions"];
        let parameters: any = jsData["parameters"];
        let responses: any = jsData["responses"];
        let securityDefinitions: any[] = jsData["securityDefinitions"];
        let security: any[] = jsData["security"];
        let tags: any = jsData["tags"];
        let externalDocs: any = jsData["externalDocs"];

        if (this.isDefined(info)) {
            let infoModel: Oas20Info = docModel.createInfo();
            this.readInfo(info, infoModel);
            docModel.info = infoModel;
        }
        if (this.isDefined(host)) { docModel.host = host; }
        if (this.isDefined(basePath)) { docModel.basePath = basePath; }
        if (this.isDefined(schemes)) { docModel.schemes = schemes; }
        if (this.isDefined(consumes)) { docModel.consumes = consumes; }
        if (this.isDefined(produces)) { docModel.produces = produces; }
        if (this.isDefined(definitions)) {
            let definitionsModel: Oas20Definitions = docModel.createDefinitions();
            this.readDefinitions(definitions, definitionsModel);
            docModel.definitions = definitionsModel;
        }

        if (this.isDefined(parameters)) {
            let parametersDefinitionsModel: Oas20ParametersDefinitions = docModel.createParametersDefinitions();
            this.readParametersDefinitions(parameters, parametersDefinitionsModel);
            docModel.parameters = parametersDefinitionsModel;
        }
        if (this.isDefined(responses)) {
            let responsesDefinitionsModel: Oas20ResponsesDefinitions = docModel.createResponsesDefinitions();
            this.readResponsesDefinitions(responses, responsesDefinitionsModel);
            docModel.responses = responsesDefinitionsModel;
        }



        if (this.isDefined(paths)) {
            let pathsModel: Oas20Paths = docModel.createPaths();
            this.readPaths(paths, pathsModel);
            docModel.paths = pathsModel;
        }
        if (this.isDefined(securityDefinitions)) {
            let securityDefinitionsModel: Oas20SecurityDefinitions = docModel.createSecurityDefinitions();
            this.readSecurityDefinitions(securityDefinitions, securityDefinitionsModel);
            docModel.securityDefinitions = securityDefinitionsModel;
        }
        if (this.isDefined(security)) {
            let securityModels: Oas20SecurityRequirement[] = [];
            for (let sec of security) {
                let secModel: Oas20SecurityRequirement = docModel.createSecurityRequirement();
                this.readSecurityRequirement(sec, secModel);
                securityModels.push(secModel);
            }
            docModel.security = securityModels;
        }
        if (this.isDefined(tags)) {
            let tagModels: Oas20Tag[] = [];
            for (let tag of tags) {
                let tagModel: Oas20Tag = docModel.createTag();
                this.readTag(tag, tagModel);
                tagModels.push(tagModel);
            }
            docModel.tags = tagModels;
        }
        if (this.isDefined(externalDocs)) {
            let externalDocsModel: Oas20ExternalDocumentation = docModel.createExternalDocumentation();
            this.readExternalDocumentation(externalDocs, externalDocsModel);
            docModel.externalDocs = externalDocsModel;
        }

        this.readExtensions(jsData, docModel);

        return docModel;
    }

    /**
     * Reads all of the extension nodes.  An extension node is characterized by a property
     * that begins with "x-".
     * @param jsData
     * @param model
     */
    private readExtensions(jsData:any, model: OasExtensibleNode): void {
        for (let key in jsData) {
            if (key.indexOf("x-") === 0) {
                let val: any = jsData[key];
                model.addExtension(key, val);
            }
        }
    }

    /**
     * Reads a OAS 2.0 Info object from the given javascript data.
     * @param info
     * @param infoModel
     */
    public readInfo(info: any, infoModel: Oas20Info): void {
        let title: string = info["title"];
        let description: string = info["description"];
        let termsOfService: string = info["termsOfService"];
        let contact: Oas20Contact = info["contact"];
        let license: Oas20License = info["license"];
        let version: string = info["version"];

        if (this.isDefined(title)) { infoModel.title = title; }
        if (this.isDefined(description)) { infoModel.description = description; }
        if (this.isDefined(termsOfService)) { infoModel.termsOfService = termsOfService; }
        if (this.isDefined(contact)) {
            let contactModel: Oas20Contact = infoModel.createContact();
            this.readContact(contact, contactModel);
            infoModel.contact = contactModel;
        }
        if (this.isDefined(license)) {
            let licenseModel: Oas20License = infoModel.createLicense();
            this.readLicense(license, licenseModel);
            infoModel.license = licenseModel;
        }
        if (this.isDefined(version)) { infoModel.version = version; }

        this.readExtensions(info, infoModel);
    }

    /**
     * Reads a OAS 2.0 Contact object from the given javascript data.
     * @param info
     * @param infoModel
     */
    public readContact(contact: any, contactModel: Oas20Contact): void {
        let name: string = contact["name"];
        let url: string = contact["url"];
        let email: string = contact["email"];

        if (this.isDefined(name)) { contactModel.name = name; }
        if (this.isDefined(url)) { contactModel.url = url; }
        if (this.isDefined(email)) { contactModel.email = email; }

        this.readExtensions(contact, contactModel);
    }

    /**
     * Reads a OAS 2.0 License object from the given javascript data.
     * @param info
     * @param infoModel
     */
    public readLicense(license: any, licenseModel: Oas20License): void {
        let name: string = license["name"];
        let url: string = license["url"];

        if (this.isDefined(name)) { licenseModel.name = name; }
        if (this.isDefined(url)) { licenseModel.url = url; }

        this.readExtensions(license, licenseModel);
    }

    /**
     * Reads a OAS 2.0 Tag object from the given javascript data.
     * @param tag
     * @param tagModel
     */
    public readTag(tag: any, tagModel: Oas20Tag): void {
        let name: string = tag["name"];
        let description: string = tag["description"];
        let externalDocs: any = tag["externalDocs"];

        if (this.isDefined(name)) { tagModel.name = name; }
        if (this.isDefined(description)) { tagModel.description = description; }
        if (this.isDefined(externalDocs)) {
            let externalDocsModel: Oas20ExternalDocumentation = tagModel.createExternalDocumentation();
            this.readExternalDocumentation(externalDocs, externalDocsModel);
            tagModel.externalDocs = externalDocsModel;
        }

        this.readExtensions(tag, tagModel);
    }

    /**
     * Reads an OAS 2.0 External Documentation object from the given javascript data.
     * @param externalDocs
     * @param externalDocsModel
     */
    public readExternalDocumentation(externalDocs: any, externalDocsModel: Oas20ExternalDocumentation): void {
        let description: string = externalDocs["description"];
        let url: any = externalDocs["url"];

        if (this.isDefined(description)) { externalDocsModel.description = description; }
        if (this.isDefined(url)) { externalDocsModel.url = url; }

        this.readExtensions(externalDocs, externalDocsModel);
    }

    /**
     * Reads an OAS 2.0 Security Requirement object from the given javascript data.
     * @param sec
     * @param secModel
     */
    public readSecurityRequirement(sec: any, secModel: Oas20SecurityRequirement): void {
        for (let name in sec) {
            secModel.addSecurityRequirementItem(name, sec[name]);
        }
    }

    /**
     * Reads an OAS 2.0 Security Definitions object from the given javascript data.
     * @param securityDefinitions
     * @param securityDefinitionsModel
     */
    public readSecurityDefinitions(securityDefinitions: any[], securityDefinitionsModel: Oas20SecurityDefinitions): void {
        for (let name in securityDefinitions) {
            let scheme: any = securityDefinitions[name];
            let schemeModel: Oas20SecurityScheme = securityDefinitionsModel.createSecurityScheme(name);
            this.readSecurityScheme(scheme, schemeModel);
            securityDefinitionsModel.addSecurityScheme(name, schemeModel);
        }
    }

    /**
     * Reads an OAS 2.0 Security Schema object from the given javascript data.
     * @param scheme
     * @param schemeModel
     */
    public readSecurityScheme(scheme: any, schemeModel: Oas20SecurityScheme): void {
        let type: string = scheme["type"];
        let description: string = scheme["description"];
        let name: string = scheme["name"];
        let in_: string = scheme["in"];
        let flow: string = scheme["flow"];
        let authorizationUrl: string = scheme["authorizationUrl"];
        let tokenUrl: string = scheme["tokenUrl"];
        let scopes: any = scheme["scopes"];

        if (this.isDefined(type)) { schemeModel.type = type; }
        if (this.isDefined(description)) { schemeModel.description = description; }
        if (this.isDefined(name)) { schemeModel.name = name; }
        if (this.isDefined(in_)) { schemeModel.in = in_; }
        if (this.isDefined(flow)) { schemeModel.flow = flow; }
        if (this.isDefined(authorizationUrl)) { schemeModel.authorizationUrl = authorizationUrl; }
        if (this.isDefined(tokenUrl)) { schemeModel.tokenUrl = tokenUrl; }
        if (this.isDefined(scopes)) {
            let scopesModel: Oas20Scopes = schemeModel.createScopes();
            this.readScopes(scopes, scopesModel);
            schemeModel.scopes = scopesModel;
        }

        this.readExtensions(scheme, schemeModel);
    }

    /**
     * Reads an OAS 2.0 Scopes object from the given javascript data.
     * @param scopes
     * @param scopesModel
     */
    public readScopes(scopes: any, scopesModel: Oas20Scopes): void {
        for (let scope in scopes) {
            let description: string = scopes[scope];
            scopesModel.addScope(scope, description);
        }
        this.readExtensions(scopes, scopesModel);
    }

    /**
     * Reads an OAS 2.0 Paths object from the given JS data.
     * @param paths
     * @param pathsModel
     */
    public readPaths(paths: any, pathsModel: Oas20Paths): void {
        for (let path in paths) {
            if (path.indexOf("x-") === 0) { continue; }
            let pathItem: any = paths[path];
            let pathItemModel: Oas20PathItem = pathsModel.createPathItem(path);
            this.readPathItem(pathItem, pathItemModel);
            pathsModel.addPathItem(path, pathItemModel);
        }
        this.readExtensions(paths, pathsModel);
    }

    /**
     * Reads an OAS 2.0 PathItem object from the given JS data.
     * @param pathItem
     * @param pathItemModel
     */
    public readPathItem(pathItem: any, pathItemModel: Oas20PathItem): void {
        let $ref: string = pathItem["$ref"];
        let get: any = pathItem["get"];
        let put: any = pathItem["put"];
        let post: any = pathItem["post"];
        let delete_: any = pathItem["delete"];
        let options: any = pathItem["options"];
        let head: any = pathItem["head"];
        let patch: any = pathItem["patch"];
        let parameters: any[] = pathItem["parameters"];

        if (this.isDefined($ref)) { pathItemModel.$ref = $ref; }
        if (this.isDefined(get)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("get");
            this.readOperation(get, opModel);
            pathItemModel.get = opModel;
        }
        if (this.isDefined(put)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("put");
            this.readOperation(put, opModel);
            pathItemModel.put = opModel;
        }
        if (this.isDefined(post)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("post");
            this.readOperation(post, opModel);
            pathItemModel.post = opModel;
        }
        if (this.isDefined(delete_)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("delete");
            this.readOperation(delete_, opModel);
            pathItemModel.delete = opModel;
        }
        if (this.isDefined(options)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("options");
            this.readOperation(options, opModel);
            pathItemModel.options = opModel;
        }
        if (this.isDefined(head)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("head");
            this.readOperation(head, opModel);
            pathItemModel.head = opModel;
        }
        if (this.isDefined(patch)) {
            let opModel: Oas20Operation = pathItemModel.createOperation("patch");
            this.readOperation(patch, opModel);
            pathItemModel.patch = opModel;
        }
        if (this.isDefined(parameters)) {
            for (let parameter of parameters) {
                let paramModel: Oas20Parameter = pathItemModel.createParameter();
                this.readParameter(parameter, paramModel);
                pathItemModel.addParameter(paramModel);
            }
        }

        this.readExtensions(pathItem, pathItemModel);
    }

    /**
     * Reads an OAS 2.0 Operation object from the given JS data.
     * @param operation
     * @param operationModel
     */
    public readOperation(operation: any, operationModel: Oas20Operation): void {
        let tags: string[] = operation["tags"];
        let summary: string = operation["summary"];
        let description: string = operation["description"];
        let externalDocs: any = operation["externalDocs"];
        let operationId: string = operation["operationId"];
        let consumes: string[] = operation["consumes"];
        let produces: string[] = operation["produces"];
        let parameters: any[] = operation["parameters"];
        let responses: any = operation["responses"];
        let schemes: string[] = operation["schemes"];
        let deprecated: boolean = operation["deprecated"];
        let security: any[] = operation["security"];

        if (this.isDefined(tags)) { operationModel.tags = tags; }
        if (this.isDefined(summary)) { operationModel.summary = summary; }
        if (this.isDefined(description)) { operationModel.description = description; }
        if (this.isDefined(externalDocs)) {
            let externalDocsModel: Oas20ExternalDocumentation = operationModel.createExternalDocumentation();
            this.readExternalDocumentation(externalDocs, externalDocsModel);
            operationModel.externalDocs = externalDocsModel;
        }
        if (this.isDefined(operationId)) { operationModel.operationId = operationId; }
        if (this.isDefined(consumes)) { operationModel.consumes = consumes; }
        if (this.isDefined(produces)) { operationModel.produces = produces; }
        if (this.isDefined(parameters)) {
            for (let parameter of parameters) {
                let paramModel: Oas20Parameter = operationModel.createParameter();
                this.readParameter(parameter, paramModel);
                operationModel.addParameter(paramModel);
            }
        }
        if (this.isDefined(responses)) {
            let responsesModel: Oas20Responses = operationModel.createResponses();
            this.readResponses(responses, responsesModel);
            operationModel.responses = responsesModel;
        }
        if (this.isDefined(schemes)) { operationModel.schemes = schemes; }
        if (this.isDefined(deprecated)) { operationModel.deprecated = deprecated; }
        if (this.isDefined(security)) {
            for (let securityRequirement of security) {
                let securityRequirementModel: Oas20SecurityRequirement = operationModel.createSecurityRequirement();
                this.readSecurityRequirement(securityRequirement, securityRequirementModel);
                operationModel.addSecurityRequirement(securityRequirementModel);
            }
        }

        this.readExtensions(operation, operationModel);
    }

    /**
     * Reads an OAS 2.0 Parameter object from the given JS data.
     * @param parameter
     * @param paramModel
     */
    public readParameter(parameter: any, paramModel: Oas20Parameter): void {
        let $ref: string = parameter["$ref"];
        if (this.isDefined($ref)) { paramModel.$ref = $ref; }

        this.readParameterBase(parameter, paramModel);
    }

    /**
     * Reads an OAS 2.0 Parameter Definition from the given JS data.
     * @param parameterDef
     * @param paramDefModel
     */
    public readParameterDefinition(parameterDef: any, paramDefModel: Oas20ParameterDefinition): void {
        this.readParameterBase(parameterDef, paramDefModel);
    }

    /**
     * Reads an OAS 2.0 Parameter object from the given JS data.
     * @param parameter
     * @param paramModel
     */
    private readParameterBase(parameter: any, paramModel: Oas20ParameterBase): void {
        this.readItems(parameter, paramModel);

        let name: string = parameter["name"];
        let in_: string = parameter["in"];
        let description: string = parameter["description"];
        let required: boolean = parameter["required"];
        let schema: any = parameter["schema"];
        let allowEmptyValue: boolean = parameter["allowEmptyValue"];

        if (this.isDefined(name)) { paramModel.name = name; }
        if (this.isDefined(in_)) { paramModel.in = in_; }
        if (this.isDefined(description)) { paramModel.description = description; }
        if (this.isDefined(required)) { paramModel.required = required; }
        if (this.isDefined(schema)) {
            let schemaModel: Oas20Schema = paramModel.createSchema();
            this.readSchema(schema, schemaModel);
            paramModel.schema = schemaModel;
        }
        if (this.isDefined(allowEmptyValue)) { paramModel.allowEmptyValue = allowEmptyValue; }
    }

    /**
     * Reads an OAS 2.0 Schema object from the given JS data.
     * @param schema
     * @param schemaModel
     */
    public readSchema(schema: any, schemaModel: Oas20Schema) {
        let $ref: string = schema["$ref"];
        let format: string = schema["format"];
        let title: string = schema["title"];
        let description: string = schema["description"];
        let default_: any = schema["default"];
        let multipleOf: number = schema["multipleOf"];
        let maximum: number = schema["maximum"];
        let exclusiveMaximum: boolean = schema["exclusiveMaximum"];
        let minimum: number = schema["minimum"];
        let exclusiveMinimum: boolean = schema["exclusiveMinimum"];
        let maxLength: number = schema["maxLength"]; // Require: integer
        let minLength: number = schema["minLength"]; // Require: integer
        let pattern: string = schema["pattern"];
        let maxItems: number = schema["maxItems"]; // Require: integer
        let minItems: number = schema["minItems"]; // Require: integer
        let uniqueItems: boolean = schema["uniqueItems"];
        let maxProperties: number = schema["maxProperties"];
        let minProperties: number = schema["minProperties"];
        let required: boolean = schema["required"];
        let enum_: any[] = schema["enum"];
        let type: string = schema["type"];

        let items: Oas20Schema[] = schema["items"];
        let allOf: Oas20Schema[] = schema["allOf"];
        let properties: any = schema["properties"];
        let additionalProperties: boolean | Oas20Schema = schema["additionalProperties"];

        let discriminator: string = schema["discriminator"];
        let readOnly: boolean = schema["readOnly"];
        let xml: Oas20XML = schema["xml"];
        let externalDocs: any = schema["externalDocs"];
        let example: any = schema["example"];

        if (this.isDefined($ref)) { schemaModel.$ref = $ref; }
        if (this.isDefined(format)) { schemaModel.format = format; }
        if (this.isDefined(title)) { schemaModel.title = title; }
        if (this.isDefined(description)) { schemaModel.description = description; }
        if (this.isDefined(default_)) { schemaModel.default = default_; }
        if (this.isDefined(multipleOf)) { schemaModel.multipleOf = multipleOf; }
        if (this.isDefined(maximum)) { schemaModel.maximum = maximum; }
        if (this.isDefined(exclusiveMaximum)) { schemaModel.exclusiveMaximum = exclusiveMaximum; }
        if (this.isDefined(minimum)) { schemaModel.minimum = minimum; }
        if (this.isDefined(exclusiveMinimum)) { schemaModel.exclusiveMinimum = exclusiveMinimum; }
        if (this.isDefined(maxLength)) { schemaModel.maxLength = maxLength; }
        if (this.isDefined(minLength)) { schemaModel.minLength = minLength; }
        if (this.isDefined(pattern)) { schemaModel.pattern = pattern; }
        if (this.isDefined(maxItems)) { schemaModel.maxItems = maxItems; }
        if (this.isDefined(minItems)) { schemaModel.minItems = minItems; }
        if (this.isDefined(uniqueItems)) { schemaModel.uniqueItems = uniqueItems; }
        if (this.isDefined(maxProperties)) { schemaModel.maxProperties = maxProperties; }
        if (this.isDefined(minProperties)) { schemaModel.minProperties = minProperties; }
        if (this.isDefined(required)) { schemaModel.required = required; }
        if (this.isDefined(enum_)) { schemaModel.enum = enum_; }
        if (this.isDefined(type)) { schemaModel.type = this.toJsonSchemaType(type); }

        if (this.isDefined(items)) {
            if (Array.isArray(items)) {
                // TODO read an array of items schemas here
            } else {
                let itemsSchemaModel: Oas20ItemsSchema = schemaModel.createItemsSchema();
                this.readSchema(items, itemsSchemaModel);
                schemaModel.items = itemsSchemaModel;
            }
        }
        if (this.isDefined(allOf)) {
            let schemaModels: Oas20Schema[] = [];
            for (let allOfSchema of allOf) {
                let allOfSchemaModel: Oas20AllOfSchema = schemaModel.createAllOfSchema();
                this.readSchema(allOfSchema, allOfSchemaModel);
                schemaModels.push(allOfSchemaModel);
            }
            schemaModel.allOf = schemaModels;
        }
        if (this.isDefined(properties)) {
            for (let propertyName in properties) {
                let propertySchema: any = properties[propertyName];
                let propertySchemaModel: Oas20PropertySchema = schemaModel.createPropertySchema(propertyName);
                this.readSchema(propertySchema, propertySchemaModel);
                schemaModel.addProperty(propertyName, propertySchemaModel);
            }
        }
        if (this.isDefined(additionalProperties)) {
            if (typeof additionalProperties === "boolean") {
                schemaModel.additionalProperties = <boolean>additionalProperties;
            } else {
                let additionalPropertiesModel: Oas20AdditionalPropertiesSchema = schemaModel.createAdditionalPropertiesSchema();
                this.readSchema(additionalProperties, additionalPropertiesModel);
                schemaModel.additionalProperties = additionalPropertiesModel;
            }
        }

        if (this.isDefined(discriminator)) { schemaModel.discriminator = discriminator; }
        if (this.isDefined(readOnly)) { schemaModel.readOnly = readOnly; }
        if (this.isDefined(xml)) {
            let xmlModel: Oas20XML = schemaModel.createXML();
            this.readXML(xml, xmlModel);
            schemaModel.xml = xmlModel;
        }
        if (this.isDefined(externalDocs)) {
            let externalDocsModel: Oas20ExternalDocumentation = schemaModel.createExternalDocumentation();
            this.readExternalDocumentation(externalDocs, externalDocsModel);
            schemaModel.externalDocs = externalDocsModel;
        }
        if (this.isDefined(example)) { schemaModel.example = example; }

        this.readExtensions(items, schemaModel);
    }

    /**
     * Reads an OAS 2.0 Items object from the given JS data.
     * @param items
     * @param itemsModel
     */
    public readItems(items: any, itemsModel: Oas20Items) {
        let type: string = items["type"];
        let format: string = items["format"];
        let itemsChild: any = items["items"];
        let collectionFormat: string = items["collectionFormat"];
        let default_: any = items["default"];
        let maximum: number = items["maximum"];
        let exclusiveMaximum: boolean = items["exclusiveMaximum"];
        let minimum: number = items["minimum"];
        let exclusiveMinimum: boolean = items["exclusiveMinimum"];
        let maxLength: number = items["maxLength"]; // Require: integer
        let minLength: number = items["minLength"]; // Require: integer
        let pattern: string = items["pattern"];
        let maxItems: number = items["maxItems"]; // Require: integer
        let minItems: number = items["minItems"]; // Require: integer
        let uniqueItems: boolean = items["uniqueItems"];
        let enum_: any[] = items["enum"];
        let multipleOf: number = items["multipleOf"];

        if (this.isDefined(type)) { itemsModel.type = this.toJsonSchemaType(type); }
        if (this.isDefined(format)) { itemsModel.format = format; }
        if (this.isDefined(itemsChild)) {
            let itemsChildModel: Oas20Items = itemsModel.createItems();
            this.readItems(itemsChild, itemsChildModel);
            itemsModel.items = itemsChildModel;
        }
        if (this.isDefined(collectionFormat)) { itemsModel.collectionFormat = this.toOas20ItemsCollectionFormat(collectionFormat); }
        if (this.isDefined(default_)) { itemsModel.default = default_; }
        if (this.isDefined(maximum)) { itemsModel.maximum = maximum; }
        if (this.isDefined(exclusiveMaximum)) { itemsModel.exclusiveMaximum = exclusiveMaximum; }
        if (this.isDefined(minimum)) { itemsModel.minimum = minimum; }
        if (this.isDefined(exclusiveMinimum)) { itemsModel.exclusiveMinimum = exclusiveMinimum; }
        if (this.isDefined(maxLength)) { itemsModel.maxLength = maxLength; }
        if (this.isDefined(minLength)) { itemsModel.minLength = minLength; }
        if (this.isDefined(pattern)) { itemsModel.pattern = pattern; }
        if (this.isDefined(maxItems)) { itemsModel.maxItems = maxItems; }
        if (this.isDefined(minItems)) { itemsModel.minItems = minItems; }
        if (this.isDefined(uniqueItems)) { itemsModel.uniqueItems = uniqueItems; }
        if (this.isDefined(enum_)) { itemsModel.enum = enum_; }
        if (this.isDefined(multipleOf)) { itemsModel.multipleOf = multipleOf; }

        this.readExtensions(items, itemsModel);
    }

    /**
     * Reads an OAS 2.0 Responses object from the given JS data.
     * @param responses
     * @param responsesModel
     */
    public readResponses(responses: any, responsesModel: Oas20Responses): void {
        let default_: any = responses["default"];
        if (this.isDefined(default_)) {
            let defaultModel: Oas20Response = responsesModel.createResponse();
            this.readResponse(default_, defaultModel);
            responsesModel.default = defaultModel;
        }

        for (let statusCode in responses) {
            if (statusCode.indexOf("x-") === 0) { continue; }
            if (statusCode === "default") { continue; }
            let response: any = responses[statusCode];
            let responseModel: Oas20Response = responsesModel.createResponse(statusCode);
            this.readResponse(response, responseModel);
            responsesModel.addResponse(statusCode, responseModel);
        }
        this.readExtensions(responses, responsesModel);
    }

    /**
     * Reads an OAS 2.0 Response object from the given JS data.
     * @param response
     * @param responseModel
     */
    public readResponse(response: any, responseModel: Oas20Response): void {
        let $ref: string = response["$ref"];
        if (this.isDefined($ref)) { responseModel.$ref = $ref; }

        this.readResponseBase(response, responseModel);
    }

    /**
     * Reads an OAS 2.0 Response Definition object from the given JS data.
     * @param response
     * @param responseDefModel
     */
    public readResponseDefinition(response: any, responseDefModel: Oas20ResponseDefinition): void {
        this.readResponseBase(response, responseDefModel);
    }

    /**
     * Reads an OAS 2.0 Response object from the given JS data.
     * @param response
     * @param responseModel
     */
    private readResponseBase(response: any, responseModel: Oas20ResponseBase): void {
        let description: string = response["description"];
        let schema: any = response["schema"];
        let headers: any = response["headers"];
        let examples: any = response["examples"];

        if (this.isDefined(description)) { responseModel.description = description; }
        if (this.isDefined(schema)) {
            let schemaModel: Oas20Schema = responseModel.createSchema();
            this.readSchema(schema, schemaModel);
            responseModel.schema = schemaModel;
        }
        if (this.isDefined(headers)) {
            let headersModel: Oas20Headers = responseModel.createHeaders();
            this.readHeaders(headers, headersModel);
            responseModel.headers = headersModel;
        }
        if (this.isDefined(examples)) {
            let exampleModel: Oas20Example = responseModel.createExample();
            this.readExample(examples, exampleModel);
            responseModel.examples = exampleModel;
        }
        this.readExtensions(response, responseModel);
    }

    /**
     * Reads an OAS 2.0 Headers object from the given JS data.
     * @param headers
     * @param headersModel
     */
    public readHeaders(headers: any, headersModel: Oas20Headers): void {
        for (let headerName in headers) {
            let header: any = headers[headerName];
            let headerModel: Oas20Header = headersModel.createHeader(headerName);
            this.readHeader(header, headerModel);
            headersModel.addHeader(headerName, headerModel);
        }
    }

    /**
     * Reads an OAS 2.0 Example object from the given JS data.
     * @param examples
     * @param exampleModel
     */
    public readExample(examples: any, exampleModel: Oas20Example): void {
        for (let contentType in examples) {
            let example: any = examples[contentType];
            exampleModel.addExample(contentType, example);
        }
    }

    /**
     * Reads an OAS 2.0 Header object from the given JS data.
     * @param header
     * @param headerModel
     */
    public readHeader(header: any, headerModel: Oas20Header): void {
        let description: string = header["description"];

        if (this.isDefined(description)) { headerModel.description = description; }
        this.readItems(header, headerModel);
    }

    /**
     * Reads an OAS 2.0 XML object from the given JS data.
     * @param xml
     * @param xmlModel
     */
    public readXML(xml: any, xmlModel: Oas20XML): void {
        let name: string = xml["name"];
        let namespace: string = xml["namespace"];
        let prefix: string = xml["prefix"];
        let attribute: boolean = xml["attribute"];
        let wrapped: boolean = xml["wrapped"];

        if (this.isDefined(name)) { xmlModel.name = name; }
        if (this.isDefined(namespace)) { xmlModel.namespace = namespace; }
        if (this.isDefined(prefix)) { xmlModel.prefix = prefix; }
        if (this.isDefined(attribute)) { xmlModel.attribute = attribute; }
        if (this.isDefined(wrapped)) { xmlModel.wrapped = wrapped; }

        this.readExtensions(xml, xmlModel);
    }

    /**
     * Reads an OAS 2.0 Definitions object from the given JS data.
     * @param definitions
     * @param definitionsModel
     */
    public readDefinitions(definitions: any, definitionsModel: Oas20Definitions) {
        for (let definitionName in definitions) {
            let definition: any = definitions[definitionName];
            let definitionSchemaModel: Oas20DefinitionSchema = definitionsModel.createDefinitionSchema(definitionName);
            this.readSchema(definition, definitionSchemaModel);
            definitionsModel.addDefinition(definitionName, definitionSchemaModel);
        }
    }

    /**
     * Reads an OAS 2.0 Parameters Definitions object from the given JS data.
     * @param parameters
     * @param parametersDefinitionsModel
     */
    public readParametersDefinitions(parameters: any, parametersDefinitionsModel: Oas20ParametersDefinitions) {
        for (let parameterName in parameters) {
            let parameter: any = parameters[parameterName];
            let parameterDefModel: Oas20ParameterDefinition = parametersDefinitionsModel.createParameter(parameterName);
            this.readParameterDefinition(parameter, parameterDefModel);
            parametersDefinitionsModel.addParameter(parameterName, parameterDefModel);
        }
    }

    /**
     * Reads an OAS 2.0 Responses Definitions object from the given JS data.
     * @param responses
     * @param responsesDefinitionsModel
     */
    public readResponsesDefinitions(responses: any, responsesDefinitionsModel: Oas20ResponsesDefinitions) {
        for (let responseName in responses) {
            let response: any = responses[responseName];
            let responseModel: Oas20ResponseDefinition = responsesDefinitionsModel.createResponse(responseName);
            this.readResponseBase(response, responseModel);
            responsesDefinitionsModel.addResponse(responseName, responseModel);
        }
    }
}


/**
 * A visitor used to invoke the appropriate readXYZ() method on the Oas20JS2ModelReader
 * class.  This is useful when reading a partial (non root) model from a JS object.  The
 * caller still needs to first construct the appropriate model prior to reading into it.
 */
export class Oas20JS2ModelReaderVisitor implements IOas20NodeVisitor {

    /**
     * Constructor.
     * @param reader
     * @param jsData
     */
    constructor(private reader: Oas20JS2ModelReader, private jsData: any) {}


    public visitDocument(node: Oas20Document): void {
        // Not supported - call the reader directly if you want to read a full document.
    }

    public visitInfo(node: Oas20Info): void {
        this.reader.readInfo(this.jsData, node);
    }

    public visitContact(node: Oas20Contact): void {
        this.reader.readContact(this.jsData, node);
    }

    public visitLicense(node: Oas20License): void {
        this.reader.readLicense(this.jsData, node);
    }

    public visitPaths(node: Oas20Paths): void {
        this.reader.readPaths(this.jsData, node);
    }

    public visitPathItem(node: Oas20PathItem): void {
        this.reader.readPathItem(this.jsData, node);
    }

    public visitOperation(node: Oas20Operation): void {
        this.reader.readOperation(this.jsData, node);
    }

    public visitParameter(node: Oas20Parameter): void {
        this.reader.readParameter(this.jsData, node);
    }

    public visitParameterDefinition(node: Oas20ParameterDefinition): void {
        this.reader.readParameterDefinition(this.jsData, node);
    }

    public visitExternalDocumentation(node: Oas20ExternalDocumentation): void {
        this.reader.readExternalDocumentation(this.jsData, node);
    }

    public visitSecurityRequirement(node: Oas20SecurityRequirement): void {
        this.reader.readSecurityRequirement(this.jsData, node);
    }

    public visitResponses(node: Oas20Responses): void {
        this.reader.readResponses(this.jsData, node);
    }

    public visitResponse(node: Oas20Response): void {
        this.reader.readResponse(this.jsData, node);
    }

    public visitResponseDefinition(node: Oas20ResponseDefinition): void {
        this.reader.readResponseDefinition(this.jsData, node);
    }

    public visitSchema(node: Oas20Schema): void {
        this.reader.readSchema(this.jsData, node);
    }

    public visitHeaders(node: Oas20Headers): void {
        this.reader.readHeaders(this.jsData, node);
    }

    public visitHeader(node: Oas20Header): void {
        this.reader.readHeader(this.jsData, node);
    }

    public visitExample(node: Oas20Example): void {
        this.reader.readExample(this.jsData, node);
    }

    public visitItems(node: Oas20Items): void {
        this.reader.readItems(this.jsData, node);
    }

    public visitTag(node: Oas20Tag): void {
        this.reader.readTag(this.jsData, node);
    }

    public visitSecurityDefinitions(node: Oas20SecurityDefinitions): void {
        this.reader.readSecurityDefinitions(this.jsData, node);
    }

    public visitSecurityScheme(node: Oas20SecurityScheme): void {
        this.reader.readSecurityScheme(this.jsData, node);
    }

    public visitScopes(node: Oas20Scopes): void {
        this.reader.readScopes(this.jsData, node);
    }

    public visitXML(node: Oas20XML): void {
        this.reader.readXML(this.jsData, node);
    }

    public visitDefinitionSchema(node: Oas20DefinitionSchema): void {
        this.reader.readSchema(this.jsData, node);
    }

    public visitPropertySchema(node: Oas20PropertySchema): void {
        this.reader.readSchema(this.jsData, node);
    }

    public visitAdditionalPropertiesSchema(node: Oas20AdditionalPropertiesSchema): void {
        this.reader.readSchema(this.jsData, node);
    }

    public visitAllOfSchema(node: Oas20AllOfSchema): void {
        this.reader.readSchema(this.jsData, node);
    }

    public visitItemsSchema(node: Oas20ItemsSchema): void {
        this.reader.readSchema(this.jsData, node);
    }

    public visitDefinitions(node: Oas20Definitions): void {
        this.reader.readDefinitions(this.jsData, node);
    }

    public visitParametersDefinitions(node: Oas20ParametersDefinitions): void {
        this.reader.readParametersDefinitions(this.jsData, node);
    }

    public visitResponsesDefinitions(node: Oas20ResponsesDefinitions): void {
        this.reader.readResponsesDefinitions(this.jsData, node);
    }

    public visitExtension(node: OasExtension): void {
        // Not supported:  cannot read a single extension
    }

}