import * as ts from 'typescript';
import {transform} from './transformer';

function getSourceFilesToEmit(program: ts.Program, targetSourceFile?: ts.SourceFile) {
    const mayEmit = (file: ts.SourceFile) => {
        return !!(file.flags & ts.NodeFlags.JavaScriptFile) && !file.isDeclarationFile
            && program.isSourceFileFromExternalLibrary(file);
    };

    const options = program.getCompilerOptions();
    if (options.outFile || options.out) {
        return program.getSourceFiles().filter(mayEmit);
    } else {
        const sourceFiles = targetSourceFile === undefined ? program.getSourceFiles() : [targetSourceFile];
        return sourceFiles.filter(mayEmit);
    }
}

export function emit(program: ts.Program, host: ts.CompilerHost, targetSourceFile?: ts.SourceFile): ts.EmitResult {
    const compilerOptions = program.getCompilerOptions();
    const newLine = host.getNewLine();
    const sourceFiles = getSourceFilesToEmit(program, targetSourceFile);
    const emittedFiles: string[] = [];
    const diagnostics: ts.Diagnostic[] = [];
    const emitSkipped = false;

    const transformed: ts.SourceFile|ts.SourceFile[] = transform(sourceFiles, compilerOptions, diagnostics);
    sourceFiles.forEach((file) => {
        host.writeFile(file.fileName, file.text, !!compilerOptions.emitBOM, (hostErrorMessage: string) => {
            diagnostics.push((ts as any).createCompilerDiagnostic(
                (ts as any).Diagnostics.Could_not_write_file_0_Colon_1, file.fileName, hostErrorMessage)
            );
        }, sourceFiles);
    });

    forEachEmittedFile(host, emitSourceFileOrBundle, transform.transformed, emitOnlyDtsFiles);

    const emittedFileNames = Array.isArray(transformed)
        ? transformed.map(file => file.fileName)
        : transformed.fileName;
    return {emitSkipped, diagnostics, emittedFiles: emittedFileNames};
}


writeFile(host, emitterDiagnostics, jsFilePath, writer.getText(), compilerOptions.emitBOM, sourceFiles);

function forEachEmittedFile(
    host: EmitHost, action: (emitFileNames: EmitFileNames, sourceFileOrBundle: SourceFile | Bundle, emitOnlyDtsFiles: boolean) => void,
    sourceFilesOrTargetSourceFile?: SourceFile[] | SourceFile,
    emitOnlyDtsFiles?: boolean) {

    const sourceFiles = isArray(sourceFilesOrTargetSourceFile) ? sourceFilesOrTargetSourceFile : getSourceFilesToEmit(host, sourceFilesOrTargetSourceFile);
    const options = host.getCompilerOptions();
    if (options.outFile || options.out) {
        if (sourceFiles.length) {
            const jsFilePath = options.outFile || options.out;
            const sourceMapFilePath = getSourceMapFilePath(jsFilePath, options);
            const declarationFilePath = options.declaration ? removeFileExtension(jsFilePath) + Extension.Dts : "";
            action({ jsFilePath, sourceMapFilePath, declarationFilePath }, createBundle(sourceFiles), emitOnlyDtsFiles);
        }
    }
    else {
        for (const sourceFile of sourceFiles) {
            const jsFilePath = getOwnEmitOutputFilePath(sourceFile, host, getOutputExtension(sourceFile, options));
            const sourceMapFilePath = getSourceMapFilePath(jsFilePath, options);
            const declarationFilePath = !isSourceFileJavaScript(sourceFile) && (emitOnlyDtsFiles || options.declaration) ? getDeclarationEmitOutputFilePath(sourceFile, host) : undefined;
            action({ jsFilePath, sourceMapFilePath, declarationFilePath }, sourceFile, emitOnlyDtsFiles);
        }
    }
}
