
import {OasDocument} from "../document.model";
import {Oas20Info} from "./info.model";
import {Oas20Tag} from "./tag.model";
import {Oas20ExternalDocumentation} from "./external-documentation.model";
import {Oas20SecurityRequirement} from "./security-requirement.model";

/**
 * Models an OAS 2.0 document.
 */
export class Oas20Document extends OasDocument {

    public readonly swagger: string = "2.0";
    public info: Oas20Info;
    public host: string;
    public basePath: string;
    public schemes: string[];
    public consumes: string[];
    public produces: string[];
    // public paths: Oas20Paths;
    // public definitions: Oas20Definitions;
    // public parameters: Oas20ParametersDefinitions;
    // public responses: Oas20ResponsesDefinitions;
    // public securityDefinitions: Oas20SecurityDefinitions;
    public security: Oas20SecurityRequirement[];
    public tags: Oas20Tag[];
    public externalDocs: Oas20ExternalDocumentation;

    constructor() {
        super();
        this._ownerDocument = this;
    }

    /**
     * Returns the spec version of this document.
     */
    public getSpecVersion(): string {
        return this.swagger;
    }

    /**
     * Creates an OAS 2.0 info object.
     * @return {Oas20Info}
     */
    public createInfo(): Oas20Info {
        let rval: Oas20Info = new Oas20Info();
        rval._ownerDocument = this;
        rval._parent = this;
        return rval;
    }

    /**
     * Creates an OAS 2.0 Tag object.
     * @return {Oas20Info}
     */
    public createTag(): Oas20Tag {
        let rval: Oas20Tag = new Oas20Tag();
        rval._ownerDocument = this;
        rval._parent = this;
        return rval;
    }

    /**
     * Adds a tag.
     * @param name
     * @param description
     * @return {Oas20Tag}
     */
    public addTag(name: string, description: string): Oas20Tag {
        let tag: Oas20Tag = this.createTag();
        tag.name = name;
        tag.description = description;
        if (!this.tags) {
            this.tags = [];
        }
        this.tags.push(tag);
        return tag;
    }

    /**
     * Creates an OAS 2.0 Security Requirement object.
     * @return {Oas20SecurityRequirement}
     */
    public createSecurityRequirement(): Oas20SecurityRequirement {
        let rval: Oas20SecurityRequirement = new Oas20SecurityRequirement();
        rval._ownerDocument = this.ownerDocument();
        rval._parent = this;
        return rval;
    }

    /**
     * Creates an OAS 2.0 External Documentation object.
     * @return {Oas20ExternalDocumentation}
     */
    public createExternalDocumentation(): Oas20ExternalDocumentation {
        let rval: Oas20ExternalDocumentation = new Oas20ExternalDocumentation();
        rval._ownerDocument = this.ownerDocument();
        rval._parent = this;
        return rval;
    }

    /**
     * Sets the external documentation information.
     * @param description
     * @param url
     */
    public setExternalDocumentation(description: string, url: string): Oas20ExternalDocumentation {
        let edoc: Oas20ExternalDocumentation = this.createExternalDocumentation();
        edoc.description = description;
        edoc.url = url;
        this.externalDocs = edoc;
        return edoc;
    }

}
