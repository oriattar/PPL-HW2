import { AppExp, CExp, Exp, isAppExp, isBoolExp, isDefineExp, isExp, isIfExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarDecl, isVarRef, PrimOp, Program ,VarDecl} from './L3/L3-ast';
import { Result, makeFailure, makeOk} from './shared/result';
import { curry, map } from "ramda";
/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [Parsed | Error] => Result<string>
*/
const cExpToPython = (exp: CExp) : string =>
   isNumExp(exp) ? exp.val.toString() :
   isBoolExp(exp) ? exp.val.toString() :
   isStrExp(exp) ? exp.val :
   isPrimOp(exp) ? exp.op :
   isVarRef(exp) ? exp.var :
   isIfExp(exp) ? "("+cExpToPython(exp.then) + " " + "if"+ " " +cExpToPython(exp.test) + " " + "else"+ " " +cExpToPython(exp.alt)+")":
   isProcExp(exp) ? "(lambda"+" "+ exp.args.map((varDecl: VarDecl): string => varDecl.var).join(",") + " : " + exp.body.map(cExpToPython).join(" ") + ")" :
   isAppExp(exp) ? handleAppExp(exp):
   "";
const handlePrimOp = (exp: PrimOp) : string =>
     exp.op === "+" ? "+":
    exp.op === "-" ? "-":
    exp.op === "*" ? "*":
    exp.op === "/" ? "/":
    exp.op === "<" ? "<":
    exp.op === ">" ? ">":
    exp.op === "=" ? "==":
    exp.op === "number?" ? "(lambda x : (type(x) == number))":
    exp.op === "boolean?" ? "(lambda x : (type(x) == bool))":
    exp.op === "eq?" ? "==":
    exp.op === "and" ? "and":
    exp.op === "or" ? "or":
    exp.op === "not" ? "not":
"";

const handleAppExp = (exp:AppExp) : string =>
   isPrimOp(exp.rator) ? exp.rator.op === "not" ? "(not " + cExpToPython(exp.rands[0]) + ")" :
 "(" + exp.rands.map(cExpToPython).join(" " + handlePrimOp(exp.rator as PrimOp) + " ") + ")"
        : cExpToPython(exp.rator) + "(" + exp.rands.map(cExpToPython).join(",") + ")";


const handleExp = (exp: Exp): string => 
   isDefineExp(exp) ? exp.var.var +" = "+ cExpToPython(exp.val) :
   cExpToPython(exp);
 export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isExp(exp) ? makeOk(handleExp(exp)) :
    isProgram(exp) ? makeOk(map(handleExp,exp.exps).reduce((acc: string, curr : string): string =>acc+"\n"+curr,"").slice(1)) :
    makeFailure("error");
