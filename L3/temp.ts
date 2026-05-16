import { makeVarDecl } from "./L3-ast";
import { Class ,makeClass} from "./L3-value";

const c = makeClass([makeVarDecl("A")],[]);
console.log(c);