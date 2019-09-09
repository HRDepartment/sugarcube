import * as ts from 'typescript';

interface Printer {
    printNode(hint: ts.EmitHint, node: Node, sourceFile: ts.SourceFile): string;
    printFile(sourceFile: ts.SourceFile): string;
    printBundle(bundle: ts.Bundle): string;
}

export function createCxxPrinter(printerOptions?: ts.PrinterOptions, handlers?: ts.PrintHandlers): Printer {
    return {
    };
}