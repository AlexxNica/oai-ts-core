import {OasExtension} from "./extension.bean";
import {OasExtensibleNode} from "./enode.bean";
import {IOasNodeVisitor} from "../visitors/visitor.iface";

/**
 * Base class for all OAS documents.  A version-specific implementation of this class
 * is expected for each version of the specification supported by the library.
 */
export abstract class OasDocument extends OasExtensibleNode {

    /**
     * Returns the version of the specification of this document.
     */
    public abstract getSpecVersion(): string;

    /**
     * Creates an extension node with this document as the ownerDocument.
     * @param name (optional)
     * @param value (optional)
     * @return {OasExtension}
     */
    public createExtension(name?: string, value?: any) {
        let rval: OasExtension = new OasExtension();
        rval._ownerDocument = this;
        if (name) {
            rval.name = name;
        }
        if (value) {
            rval.value = value;
        }
        return rval;
    }

    /**
     * Accepts the given OAS node visitor and calls the appropriate method on it to visit this node.
     * @param visitor
     */
    public accept(visitor: IOasNodeVisitor): void {
        visitor.visitDocument(this);
    }

}