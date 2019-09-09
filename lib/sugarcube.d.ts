/// <reference no-default-lib="true"/>

/* Qualifiers */
declare type constant<T> = T;
declare type volatile<T> = T;
declare type mutable<T> = T;

declare interface Ptr<T> {
    // Getters
    ['&']: size_t;
    ['*']: T;
    // Setter
    ['='](value: T): T;
}

declare interface Ref<T> extends Ptr<T> {}
declare interface ConstRef<T> extends constant<Ref<T>> {}
declare interface ConstPtr<T> extends constant<Ptr<T>> {}

declare type char = number;
declare type short = number;
declare type int = number;
declare type float = number;
declare type long = number;
declare type longlong = number;
declare type double = number;
declare type bool = boolean;
declare type unsigned = number;
declare type signed = number;
declare type cstr = constant<Ptr<string>>;
declare type nullptr = null;
declare type size_t = number;
declare type usize_t = number;
declare type carr<T> = {[idx: number]: T};
declare type refable_carr<T> = {[idx: number]: T & Ref<T>};

declare function refable<T>(value: T): T & Ref<T>;
declare function refable_static<T>(value: T): T & Ref<T>;
declare function carr<T>(arr: T[]): carr<T>;
declare function refable_carr<T>(arr: T[]): refable_carr<T>;
declare function char(value: any): char;
declare function short(value: any): short;
declare function int(value: any): int;
declare function float(value: any): float;
declare function long(value: any): long;
declare function longlong(value: any): longlong;
declare function double(value: any): double;
declare function bool(value: any): bool;
declare function cstr(value: any): cstr;
declare function ptr<T>(value: T): Ptr<T>;
declare function ref<T>(value: T): Ref<T>;
declare function deref<T, Y extends Ptr<T>>(value: Y): T; 


/* Casts */
declare function static_cast<T>(value: any): T
declare function reinterpret_cast<T>(value: any): T;
declare function const_cast<T>(value: any): T;
declare function dynamic_cast<T>(value: any): T;

// TODO <typeinfo>
/**
 * sizeof with value operand (e.g. sizeof(10))
 */
declare function sizeof(value: any): number;
/**
 * sizeof with type operand (e.g. sizeof(int), which is sizeof<int>() here; compiled to that form)
 */
declare function sizeof<T>(): number;
declare function typeid(value: any): number;

/* C Preprocessor */
declare namespace cpp {
    /* Standard */
    function pragma(str: string): void;
    function define(name: string, value?: string | number): void;
    function ifdef(then: () => void): void;
    function ifndef(then: () => void): void;
    function error(msg: string): never;

    const __LINE__: longlong;
    const __FILE__: cstr;
    const __DATE__: cstr;
    const __TIME__: cstr;
    const __cplusplus: longlong;

    /* Extensions */
    function macro(name: string, block?: string | (() => void));
    function match(options: {[val: string]: () => void;}): void;
    let _: symbol;
}



declare function assert(condition: bool): void;

/* inline include */
/**
 * [C++ Interop, C++ Taint]
 * 
 * Makes a best effort attempt to emit C++ inline. This may produce syntax errors if complicated syntax is used in the surrounding code.
 */
declare function __cxx(inline: string);
/**
 * [C++ Interop; C++ Taint]
 * 
 * Emits __asm(inline) where inline is included verbatim; making it possible to introduce syntax errors.
 * 
 * e.g.
 * 
 * ```
    __asm(`"leal (%0,%0,4),%0"
         : "=r" (n)
         : "0" (n)`);
    ```
 */
declare function __asm(inline: string): void;

/* Decorators */
declare function inline(fn: any);
declare function volatile(fn: any);
declare function virtual(fn: any);
declare function static(fn: any);
declare function friend(fn: any);
declare function template(args: {[k: string]: any});
declare function constexpr<T>(value: T): T;


declare namespace std {
    class allocator<T> {}
    abstract class exception {}
}

/**
 * Further helpers for specifying C++ and JS behavior.
 */
declare namespace cc {
    interface Destructable {
        destructor(): void;
    }

    /**
     * [JS, C++ Interop]
     * 
     * JS: Extends T with Ptr methods, making it a suitable pointer. If T defines these methods
     * in JS land and they are used, [C++ Taint] occurs. Use `std.allocp` in this case.
     * 
     * C++: Declares something should be allocated on the heap (`new` in C++).
     * `new` doesn't actually compile to anything, it simply exists for JS class interop.
     * 
     * Classes can be allocated as follows:
     * ```ts
     * cc.alloc(new A(params));
     * ```
     * 
     * POD structs (using interfaces) can be allocated using an inline object with a typecast or an inlined helper (names that start with $ - this symbol is forbidden in C++).
     * ```ts
     * let $Color: Color = {r: 0, g: 0, b: 0};
     * let red = cc.alloc($Color);
     * // or
     * red = cc.alloc({r: 0, g: 0xff, b: 0} as Color);
     * white.r = 255;
     * cc.free(red);
     * ```
     * 
     * The JS implementation checks whether the passed object is a class or a pure object.
     */
    function alloc<T>(value: T): T & Ptr<T>;
    /**
     * [JS, C++ Interop]
     * 
     * Like `cc.alloc`, does not taint the type with Ptr methods, making ['*']() calls mandatory.
     * This also results in code being compiled as (*b).a() rather than b->a(), which bypasses operator -> (may or may not be desirable).
     * 
     * This is useful if T defines `deref` or any of the assignment operators in JS land.
     */
    function allocp<T>(value: T): Ptr<T>;
    /**
     * [JS, C++ Interop]
     * 
     * JS: If the value after dereferencing has the supplied `explicit delete overload` (default: 'delete') defined, it is called (operator delete).
     * 
     * C++: Calls `delete` on an allocated (cc.alloc, cc.allocp) value. Second parameter is ignored.
     */
    function free(value: Ptr<any>, js_explicit_delete_overload?: string): void;

    /**
     * [JS, C++ Interop]
     * 
     * See cc.free().
     * 
     * JS: Calls cc.free on every element in the array
     * 
     * C++: Calls `delete[]`
     */
    function free_arr(value: Ptr<any[]>, js_explicit_delete_overload?: string): void;

    /**
     * [JS, C++ Interop]
     * 
     * JS: Automatic estructors are completely unsupported; this method calls .destructor on the specified object, if present. See also: `cc.raii`
     * 
     * This method is only required when the destructor of a
     * class (~Class) would be called implicitly by leaving scope and has meaningful side effects
     * (not just a deallocation, as that is handled by the garbage collector in JS).
     * 
     * C++: If the `cc_explicit` parameter is the keyword `true` (references unsupported), calls the destructor explicitly, e.g:
     * 
     * `struct B {~B() {}} b; b.~B();`
     * 
     * This is rarely useful, but the possibility is supplied. Since this use case is extremely rare, a second argument is
     * required to note that this use is desired.
     */
    function destruct(value: any, cc_explicit?: boolean): void;

    /**
     * [JS Interop]
     * 
     * JS: Required to run (in C++, implicit) copy constructors for non-primitive types (which in JS are always by reference as they are objects).
     * Defaults to 'constructor$copy'; if the supplied copy constructor doesn't exist, 
     * 
     * C++: Ignored, copies are implicit.
     */
    function copy<T>(value: T, js_copy_constructor?: string): T;

    /**
     * [JS Interop]
     * 
     * JS: Configures a JS method to be unenumerable. May be desirable for ugly $ overloads.
     * 
     * C++: Ignored. Use `private` if you want a private method (works for both languages).
     */
    function js_unenumerable(target: () => any, key: string, descriptor: object): object;

    /**
     * [JS Interop]
     * 
     * JS: Generates a suitable generator from a class that supports the C++ range-for construct.
     * Example implementation for an array:
     * ```js
     * begin() { return 0; }
     * end() { return this.length; }
     * [Symbol.iterator]() {
     *     return cc.rangefor(this, (at) => this[at]);
     * }```
     * 
     * C++: `[Symbol.iterator]` is ignored in C++ code.
     */
    function rangefor<T>(self: {
        begin(): number;
        end(): number;
    }, value_at: (at: number) => T): Iterator<T>;

    /**
     * [JS Interop]
     * 
     * Makes JS aware of RAII These forms are all no-ops in C++,
     * as this method exists purely to make RAII more ergonomic than calling cc.destruct a bunch (prone to error).
     * JS code doesn't need to know about destructors if it only handles memory owned by the garbage collector (e.g. pointers, destructors which only use cc.free)
     * 
     * This function supports 3 forms:
     * 1. Create a RAII scope. Values registered with cc.raii have cc.destruct called on them at the end of the scope.
     * This form has to be used for standalone functions, as TypeScript does not support decorators on functions that aren't class methods.
     * ```ts
     * cc.raii(function () {
     *     let ptr = cc.raii(std.make_shared<Color>(c));
     * })```
     * 2. As a decorator
     * ```ts
     * class A {
     *     @cc.raii b() {}
     * }
     * ```
     * 3. Register a value (must have a `destruct` method)
     * ```ts
     * let v = cc.raii(myvalue);
     * ```
     */
    function raii(fn: () => void): void;
    function raii<T>(target: any, propertyKey: string | symbol, descriptor: any): any;
    function raii<T extends Destructable>(value: T): T;

    /**
     * [JS Interop]
     * 
     * Calls the passed main() function with values from process, if running in NodeJS.
     * 
     * Ignored by C++. Use this in your main module.
     */
    function main(main: (argc: int, argv: Ptr<carr<cstr>>) => int): Promise<int>;
}

/// <reference path="string.d.ts"/>
/// <reference path="vector.d.ts"/>

/// <reference path="initializer_list.d.ts"/>
/// <reference path="memory.d.ts"/>