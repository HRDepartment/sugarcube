# Sugarcube

Sugarcube is a transpiler, capable of compiling a subset of (and somewhat annotated) TypeScript to a subset of C++14. The source TypeScript code is fully capable of running standalone with the necessary libraries. Use `tsc` to compile it to JavaScript.

It consists of three components:

* Transpiler
* Library (d.ts and JS implementation)
* Build system emitter

Sugarcube is capable of spitting out functional CMake build scripts. Currently, we support clang for building your code.

The goal is to support most C++14 features, short of constexprs and advanced memory features such as allocators.

## Use cases

* Writing TS with familiar JS features, and compile it to C++ for performance, leveraging the C++'s compiler's advanced optimizations.
* Writing TS C++-style, compiling it to C++ for performance (nodejs add-on), and falling back to slower JS output from tsc if there is no C++ compiler or pre-compiled binaries present.
* Sharing business logic or data (enums) between C++ and JS codebases.

## License
[MIT](LICENSE)