/**
 * @license
 * Copyright 2017 Red Hat
 *
 * Licensed under the Apache License, Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-3.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {OasDocument} from "../document.model";
import {Oas30Info} from "./info.model";
import {Oas30Server} from "./server.model";
import {Oas30SecurityRequirement} from "./security-requirement.model";
import {Oas30ExternalDocumentation} from "./external-documentation.model";
import {Oas30Tag} from "./tag.model";

/**
 * Models an OAS 3.0.x document.
 */
export class Oas30Document extends OasDocument {

    public openapi: string = "3.0.0";
    public info: Oas30Info;
    public servers: Oas30Server[];
    // public paths: Oas30Paths;
    // public components: Oas30Components;
    public security: Oas30SecurityRequirement[];
    public tags: Oas30Tag[];
    public externalDocs: Oas30ExternalDocumentation;

    constructor() {
        super();
        this._ownerDocument = this;
    }

    /**
     * Returns the spec version of this document.
     */
    public getSpecVersion(): string {
        return this.openapi;
    }

    /**
     * Creates an OAS 3.0 info object.
     * @return {Oas30Info}
     */
    public createInfo(): Oas30Info {
        let rval: Oas30Info = new Oas30Info();
        rval._ownerDocument = this;
        rval._parent = this;
        return rval;
    }

    /**
     * Creates an OAS 3.0 Server object.
     * @return {Oas30Info}
     */
    public createServer(): Oas30Server {
        let rval: Oas30Server = new Oas30Server();
        rval._ownerDocument = this;
        rval._parent = this;
        return rval;
    }

    /**
     * Adds a server.
     * @param url
     * @param description
     * @return {Oas30Server}
     */
    public addServer(url: string, description: string): Oas30Server {
        let server: Oas30Server = this.createServer();
        server.url = url;
        server.description = description;
        if (!this.servers) {
            this.servers = [];
        }
        this.servers.push(server);
        return server;
    }

    /**
     * Creates an OAS 3.0 Security Requirement object.
     * @return {Oas30SecurityRequirement}
     */
    public createSecurityRequirement(): Oas30SecurityRequirement {
        let rval: Oas30SecurityRequirement = new Oas30SecurityRequirement();
        rval._ownerDocument = this.ownerDocument();
        rval._parent = this;
        return rval;
    }

    /**
     * Creates an OAS 3.0 Tag object.
     * @return {Oas30Info}
     */
    public createTag(): Oas30Tag {
        let rval: Oas30Tag = new Oas30Tag();
        rval._ownerDocument = this;
        rval._parent = this;
        return rval;
    }

    /**
     * Adds a tag.
     * @param name
     * @param description
     * @return {Oas30Tag}
     */
    public addTag(name: string, description: string): Oas30Tag {
        let tag: Oas30Tag = this.createTag();
        tag.name = name;
        tag.description = description;
        if (!this.tags) {
            this.tags = [];
        }
        this.tags.push(tag);
        return tag;
    }

    /**
     * Creates an OAS 3.0 External Documentation object.
     * @return {Oas30ExternalDocumentation}
     */
    public createExternalDocumentation(): Oas30ExternalDocumentation {
        let rval: Oas30ExternalDocumentation = new Oas30ExternalDocumentation();
        rval._ownerDocument = this.ownerDocument();
        rval._parent = this;
        return rval;
    }

    /**
     * Sets the external documentation information.
     * @param description
     * @param url
     */
    public setExternalDocumentation(description: string, url: string): Oas30ExternalDocumentation {
        let edoc: Oas30ExternalDocumentation = this.createExternalDocumentation();
        edoc.description = description;
        edoc.url = url;
        this.externalDocs = edoc;
        return edoc;
    }

}
