///<reference path="../node_modules/@types/jasmine/index.d.ts"/>

import {Oas20Document} from "../src/models/2.0/document.model";
import {Oas20Info} from "../src/models/2.0/info.model";
import {Oas20Operation} from "../src/models/2.0/operation.model";
import {Oas20PathItem} from "../src/models/2.0/path-item.model";
import {Oas20ResponseDefinition} from "../src/models/2.0/response.model";
import {OasLibraryUtils} from "../src/library.utils";

declare var readJSON:any;

describe("Partial Read (2.0)", () => {

    let library: OasLibraryUtils;
    let document: Oas20Document;

    beforeEach(() => {
        library = new OasLibraryUtils();
        document = <Oas20Document> library.createDocument("2.0");
    });

    it("Info", () => {
        let json: any = readJSON('tests/fixtures/partial-read/2.0/info.json');
        let infoModel: Oas20Info = document.createInfo();
        library.readNode(json, infoModel);
        document.info = infoModel;

        let expectedObj: any = {
            swagger: "2.0",
            info: json
        }
        let actualObj: any = library.writeNode(document);
        expect(actualObj).toEqual(expectedObj);
    });

    it("Operation", () => {
        let json: any = readJSON('tests/fixtures/partial-read/2.0/path-get.json');
        document.paths = document.createPaths();
        let pathItem: Oas20PathItem = document.paths.addPathItem("/testPath", document.paths.createPathItem("/testPath"));
        let opModel: Oas20Operation = pathItem.createOperation("get");
        library.readNode(json, opModel);
        pathItem.get = opModel;

        let expectedObj: any = {
            swagger: "2.0",
            paths: {
                "/testPath": {
                    "get": json
                }
            }
        }
        let actualObj: any = library.writeNode(document);
        expect(actualObj).toEqual(expectedObj);
    });

    it("Response", () => {
        let json: any = readJSON('tests/fixtures/partial-read/2.0/response.json');
        document.responses = document.createResponsesDefinitions();
        let responseModel: Oas20ResponseDefinition = document.responses.addResponse("ExampleResponse", document.responses.createResponse("ExampleResponse"));
        library.readNode(json, responseModel);

        let expectedObj: any = {
            swagger: "2.0",
            responses: {
                "ExampleResponse": json
            }
        }
        let actualObj: any = library.writeNode(document);
        expect(actualObj).toEqual(expectedObj);
    });

});
