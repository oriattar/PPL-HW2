import { ClassExp, ProcExp, Exp, Program, makeProcExp, makeVarDecl, makeIfExp ,IfExp, Binding, makeAppExp, makePrimOp,makeStrExp,makeVarRef, makeBinding, makeBoolExp, isBoolExp, isNumExp, isStrExp, isLitExp, isPrimOp, isVarRef, isAtomicExp, isIfExp, isClassExp, CExp,DefineExp, isDefineExp, makeDefineExp, isAppExp, isExp, isProcExp, makeProgram, isProgram, isLetExp, makeLetExp, makeLitExp} from "./L3-ast";
import { Result, makeFailure, makeOk, bind, mapResult } from "../shared/result";
import { curry, map } from "ramda";
import { mapv } from "../shared/optional";
import { makeSymbolSExp } from "./L3-value";


/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp =>{
    //@TODO
    const binds = exp.methods.reverse();
    const firstMethod = binds[0];
    const methods = binds.slice(1);

    const firstIf = makeIfExp(makeAppExp(makePrimOp("eq?"),[makeVarRef("msg"),makeLitExp(makeSymbolSExp(firstMethod.var.var))]),getProcBody(firstMethod),makeLitExp(makeSymbolSExp("error")));
    const ifEx = methods.reduce((acc:IfExp , curr:Binding):IfExp=>
        makeIfExp(makeAppExp(makePrimOp("eq?"),[makeVarRef("msg"),makeLitExp(makeSymbolSExp(curr.var.var))]),getProcBody(curr),acc),firstIf);
    return makeProcExp(exp.fields,[makeProcExp([makeVarDecl("msg")],[ifEx])]);
}

const getProcBody =(bind:Binding):CExp=>
    isProcExp(bind.val) ? bind.val.body[0] :
    bind.val;
/*
Purpose: Transform all class forms in the given AST to procs
Signature: transform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
const transformCExp = (exp: CExp) : CExp =>
    isAtomicExp(exp) ? (exp) :
    isLitExp(exp) ? (exp) :
    isIfExp(exp) ? makeIfExp(transformCExp(exp.test), transformCExp(exp.then), transformCExp(exp.alt)) :
    isClassExp(exp) ? transformCExp(class2proc(exp)) :
    isAppExp(exp) ? makeAppExp(transformCExp(exp.rator), map(transformCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(transformCExp, exp.body)) :
    isLetExp(exp) ? makeLetExp(map((b:Binding):Binding=> makeBinding(b.var.var, transformCExp(b.val)), exp.bindings), map(transformCExp, exp.body)):
    exp;

const transformExp = (exp: Exp ):Exp=> 
    isDefineExp(exp) ? makeDefineExp(exp.var, transformCExp(exp.val)):
    transformCExp(exp);


export const transform = (exp: Exp | Program): Result<Exp | Program> =>
    isExp(exp) ? makeOk(transformExp(exp)) :
    isProgram(exp) ? makeOk(makeProgram(map(transformExp, exp.exps))):
    makeFailure("Unknown expression | program type");