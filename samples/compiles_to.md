## JS Primitives

```ts
let str1 = "string";
let str2 = new std.string("string");
let str3 = cstr('string');
let chr = char("a");
let interop = "string".length;

interface Color {
    r: int;
    g: int;
    b: int;
}

let black: Color = {r: 0xff, g: 0xff, b: 0xff};
let green = {r: 0, g: 0xff, b: 0} as Color;
let white = cc.alloc({r: 0, g: 0xff, b: 0} as Color);
white.r = 254;
cc.free(white);

let $Color: Color = {r: 0, g: 0, b: 0};
let red = cc.alloc($Color);
white.r = 255;
cc.free(red);
```
becomes
```cpp
#include <string>

std::string str1 = "string";
std::string str2("string");
const char* str3 = "string";
char c = 'a';
int interop = std::string("string").length();

struct Color {
    int r, g, b;
};

struct Color black = {0xff, 0xff, 0xff};
struct Color green = {.g = 0xff};
struct Color* white = new Color();
white->r = 254;
delete white;

struct Color* red = new Color();
white->r = 255;
delete white;
```

## Member access
Member access uses JS `.` everywhere; even where you would use :: in C++. This is a necessity to remain interopable with JS, but it means we can't support `any` anywhere, unfortunately.

```ts
let a = new std.string("Hello");
a.append(" world!");

let b = cc.alloc(new std.string("Hello"));
b.append(" pointers!");
cc.free(b);

const {string} = std;
let c = cc.alloc(new string("Hello!"));
console.log(c.size());
cc.free(c);

global.printf("Hello!");
```
becomes
```cpp
std::string a("Hello");
a.append(" world!");

std::string* b = new std::string("Hello");
a->append(" pointers!");
delete b;

using std::string;
string* c = new string("Hello!");
std::cout << c->size();
delete c;

::printf("Hello!");
```

## Function statics

As it's really awkward to add static methods to functions in a JS way, it might seem complicated to add statics to functions. Fortunately, TypeScript supplies the functionality in a verbose, frankly hacky way, without requiring type gymnastics. The compiler handles the case of a namespace occupying the same name as a function. This all works without helpers needed to run when compiled to JS.

```ts
function count() {
    return count.n++;
}
namespace count {
    export let n: int = 0;
}
```
becomes
```
int count() {
    static int n = 0;
    return n++;
}
```

To support references, do this instead:

```ts
function count(): Ref<int> {
    return count.n;
}
namespace count {
    export let n = refable_static(0 as int);
}
```
becomes
```
int& count() {
    static int n = 0;
    return n;
}
```

## `#include`

`#include` is replicated using a plain `import`:

```ts
import './file';
var foo = file();
```
becomes
```cpp
#include "file.h"
auto foo = file();
```

Note that most standard headers are implicitly imported upon being used, such as std::string.
```ts
let s = new std.string();
console.log("Hello!");
```
becomes
```cpp
#include <iostream>
#include <string>
std::string s;
std::cout << "Hello!" << std::endl;
```

`import '<string>'` may be done explicitly, but is effectively a no-op if standard header is imported implicitly. Not-yet-supported standard library headers may be imported explicitly like this if a suitable d.ts is available.

## console

There is partial support for some console methods. These are compiled as if they were a macro. C++ doesn't support implicit .toString; this should be done yourself as it more or less outputs verbatim. The concatenation operators here are used to guarantee that there is no space added; this case is compiled differently than it would otherwise. Template strings are also supported.

```ts
console.log("Number[" + 30 + "]");
console.log("Numbers", 10, 20, 30);
console.log(`Number[${30}]`);
```
becomes
```cpp
#include <iostream>
std::cout << "Number[" << 30 << "]" << std::endl;
std::cout << "Numbers" << " " << 10 << " " << 20 << " " << 30 << std::endl;
std::cout << "Number[" << 30 << "]" << std::endl;
```

## Exports

In TS, everything must be marked as an `export` to be exported. Values in a file's scope are automatically marked static unless they are `export`ed.
```ts
// top level scope
var a = 10;
function retA(): int {
    return a;
}
let b: unsigned = 20;
function retB(): unsigned {
    return b;
}
export {b, retB};
```
becomes
```cpp
static auto a = 10;
static int retA() {
    return a;
}
unsigned b = 20;
unsigned retB() {
    return b;
}
```

Naturally, this means you'll either have write .d.ts files for (external) libraries with `declare global` and use the former plain `import`, or you can import the symbols you need, which are then revealed in the current file as you would expect (using an anonymous namespace if they are nested).

Another difference is that paths in TS are relative to the current file; whereas paths in C++ are relative to the base of the project. When compiling to C++, this is handled transparently using the defined root in your tsconfig.

```ts
// debug.ts
import '<string>';
import '<iostream>';
export function debuglog(arg: ConstRef<std.string>) { console.log(arg); }
// image/pixel.ts
import '<sstream>';
import {debuglog} from '../debug';
export @struct class Pixel {
    constructor(public r: int, public g: int, public b: int) {
        debuglog(cc.str`Created pixel ${r} ${g} ${b}`);
    }
}
// canvas.ts
import {Pixel} from './image/pixel';
function main(): int {
    let a = new Pixel(10, 20, 30);
    let b = new Pixel(0xff, 0xff, 0xff);
    return 0;
}
```
becomes
```cpp
// debug.h
#pragma once
#include <string>
#include <iostream>
void debuglog(const std::string& arg);
// debug.cc
#include "debug.h"
void debuglog(const std::string& arg) {
    std::cout << arg;
};
// image/pixel.h
#pragma once
#include <sstream>
#include "debug.h"
struct Pixel {
    int r;
    int g;
    int b;
    Pixel(int r, int g, int b): r(r), g(g), b(b) {
        std::ostringstream str;
        str << "Created pixel "
            << r
            << " "
            << g
            << " "
            << b;
        debuglog(str.str());
    }
};
// canvas.cc
int main() {
    Pixel a(10, 20, 30);
    Pixel b(0xff, 0xff, 0xff);
}
```

## Enum

Since TS has named enums, 

## Emit `auto` for hygenic purposes

It may be desirable to emit 'auto' as type in C++. Note that knowledge of the type for the TypeScript is still required (`any` can only be referenced as void*, other uses are errors), as it is in C++. Stemming from JS, there is a (now rarely used) leftover keyword we can use to signify this without having to use a wrapper noop function: `var`. This also happens to be the keyword used in C# (which TypeScript is remarkably similar to) for this purpose, so it seems like a natural fit.

Note that this is a possible way to shoot yourself in the foot: C++ only has block scope, so it is possible to write code that behaves differently based on compile target this way.

```ts
var a = 10;
```
becomes
```cpp
auto a = 10;
```

## typedef

```ts
type ulong = unsigned&long;
```
becomes
```cpp
typedef unsigned long ulong;
```

## class

Classes are basically same as structs as you would use them in C++ due to the by-default public rules. Initialization is also a little more awkward. `this` is required of course, but is removed everywhere.

## struct

Use the @struct decorator for a fully fledged struct or use interface for a POD struct.
```ts
interface S {
    a: int;
    b: int;
}
let a: S = {a: 10, b: 20};
let a = ptr<S>();
```
becomes
```cpp
struct S {
    int a;
    int b;
}
S a = {10, 20};
S* a;
``` 

```ts
import '<iostream>';
@struct class A {
    constructor(private a: bool) { console.log(a); }
}
```
becomes
```cpp
#include <iostream>
struct A {
    A(bool _a): a(_a) {
        std::cout << a;
    }
    private:
    bool a;
}
```

To forward-declare a struct, use `declare interface`.
```ts
declare interface Magic{}
```
becomes
```cpp
struct Magic;
```

### Local classes

Example from C++ refernece
```ts
import '<vector>'
import '<algorithm>'
import '<iostream>'

function main(): int {
    let v = new std.vector<int>(1,2,3);
    @struct class Local {
        ['()'](n: int, m: int): bool {
            return n > m;
        }
    }
    std.sort(v.begin(), v.end(), new Local()); // since C++11
    for (let n of v) console.log(n, ' ');
    return 0;
}
```
becomes
```cpp
#include <vector>
#include <algorithm>
#include <iostream>
 
int main()
{
    std::vector<int> v{1,2,3};
    struct Local {
       bool operator()(int n, int m) {
           return n > m;
       }
    };
    std::sort(v.begin(), v.end(), Local()); // since C++11
    for(int n: v) std::cout << n << ' ';
}
```