import * as ts from 'typescript';
import {cxxBefore, cxxAfter} from './cxx-transformer';
import {createCxxPrinter} from './cxx-printer';

const libdts = "sugarcube.d.ts";
let loadedLibDTs = '';

export function transpile(fileNames: string[], options: ts.CompilerOptions) {
    // let program = ts.createProgram(fileNames, options);
}
export function transpileModule(input: string, transpileOptions?: ts.TranspileOptions, dts?: string) {
    const options: ts.CompilerOptions =
        (transpileOptions && transpileOptions.compilerOptions) || ts.getDefaultCompilerOptions();

    options.isolatedModules = true;
    options.suppressOutputPathCheck = true;
    options.allowNonTsExtensions = true;
    options.noLib = true;
    options.lib = undefined;
    options.types = undefined;
    options.noEmit = undefined;
    options.noEmitOnError = undefined;
    options.paths = undefined;
    options.rootDirs = undefined;
    options.declaration = undefined;
    options.declarationDir = undefined;
    options.out = undefined;
    options.outFile = undefined;
    options.noResolve = true;

    // custom
    options.sourceMap = undefined;
    options.target = ts.ScriptTarget.ESNext;
    options.module = ts.ModuleKind.ESNext;
    options.allowJs = false;

    // if jsx is specified then treat file as .tsx
    const inputFileName = (transpileOptions && transpileOptions.fileName) || (options.jsx ? "module.tsx" : "module.ts");
    const sourceFile = ts.createSourceFile(inputFileName, input, options.target!);
    if (transpileOptions) {
        if (transpileOptions.moduleName) {
            sourceFile.moduleName = transpileOptions.moduleName;
        }
    }

    const newLine = (ts as any).getNewLineCharacter(options);

    // Output
    let outputText = '';

    // Create a compilerHost object to allow the compiler to read and write files
    const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName) => {
            if (fileName === (ts as any).normalizePath(inputFileName)) {
                return sourceFile;
            } else if (fileName === (ts as any).normalizePath(libdts)) {
                return dts !== undefined
                    ? dts
                    : (!require || loadedLibDTs
                        ? loadedLibDTs
                        : (loadedLibDTs = require('fs').readFileSync(require('path').join(__dirname, 'lib', libdts)))
                    );
            }
            return undefined;
        },
        writeFile: (_, text) => {
            outputText = text;
        },
        getDefaultLibFileName: () => libdts,
        useCaseSensitiveFileNames: () => false,
        getCanonicalFileName: fileName => fileName,
        getCurrentDirectory: () => "",
        getNewLine: () => newLine,
        fileExists: (fileName): boolean => fileName === inputFileName || fileName === libdts,
        readFile: () => "",
        directoryExists: () => true,
        getDirectories: () => []
    };

    const program = ts.createProgram([inputFileName], options, compilerHost);
    // (ts as any).createPrinter = createCxxPrinter;
    const emitResult = program.emit(
        undefined,
        undefined,
        undefined,
        undefined,
        {before: [cxxBefore(program)], after: [cxxAfter(program)]}
    );
    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    return {outputText, diagnostics};
}
