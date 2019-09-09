
// tslint:disable
/// <reference path="./lib/sugarcube.d.ts"/>

/* -> using std::vector */
const {vector} = std;


let str1 = "string";
let str2 = new std.string("string");
let str3 = cstr("string");
let interop = "string".length;

interface Color {
    r: int;
    g: int;
    b: int;
}

let black: Color = {r: 0xff, g: 0xff, b: 0xff};
let green = {r: 0, g: 0xff, b: 0} as Color;
let white = cc.alloc({r: 0, g: 0, b: 0} as Color);
white.r = 254;
cc.free(white);

///
let vals = refable_carr([10.1, 12.6, 33.1, 24.1, 50.0] as double[]);

function setValues(i: int): Ref<double> {
    return vals[i]; // return a reference to the ith element
}

function main(): int {
    console.log("Value before change");
    for (let i: int = 0; i < 5; i++) {
        console.log("vals[", i, "] = ");
        console.log(vals[i]);
    }

    setValues(1)['='](20.23);
    setValues(3)['='](70.8);

    console.log("Value after change");
    for (let i: int = 0; i < 5; i++) {
        console.log("vals[" + ({}) + "] = ");
        console.log(vals[i]);
    }
    return 0;
}

function count() {
    return count.n;
}
namespace count {
    export let n: int = 0;
}
///
/*
#include <iostream>

double vals[] = {10.1, 12.6, 33.1, 24.1, 50.0};
 
double& setValues( int i ) {
   return vals[i];
}
 
int main () {
   std::cout << "Value before change" << std::endl;
   for ( int i = 0; i < 5; i++ ) {
      cout << "vals[" << i << "] = ";
      cout << vals[i] << endl;
   }
 
   setValues(1) = 20.23; // change 2nd element
   setValues(3) = 70.8;  // change 4th element
 
   cout << "Value after change" << endl;
   for ( int i = 0; i < 5; i++ ) {
      cout << "vals[" << i << "] = ";
      cout << vals[i] << endl;
   }
   return 0;
}*/

cpp.match({
    0: () => cpp.define('MONGO_JSON_DEBUG(message)', 'log() << "JSON_DEBUG"'),
    [cpp._]: () => cpp.define('MONG_JSON_DEBUG(message)', '')
});

cpp.define('ALPHA', 'ABCDEFGHIJK');

const LBRACE: cstr = ptr("{");

let a = new std.string("ABC");

/* implicit template <typename T> */
class A<T> {}

/* implicit template <> */
// class template specialization
class A$num extends A<number> {
    get(): Ptr<int> { return ptr(50); }
    constructor$copy(other: constant<Ref<A$num>>): void {/**/}
    constructor$move(to: Ref<Ref<A$num>>): void {/**/}
    ['='](other: constant<Ref<A$num>>): Ref<A$num> {
        return ptr(this);
    }
}

new A$num().get()['='](15);

/* always compiles to class B<T>: protected A<T> {} */
class B<T> extends A<T> {}

abstract class C {
    abstract a(): int;
}

/* ->
    class C {
    public:
        virtual int a() = 0;
    }
 */

try {
    cpp.define('a', '1');
} catch (e) {
    if (e instanceof ref(std.exception)) {/**/}
}

// TODO: const member overloads
// TODO: multiple inheritance (use wrapper class)
/* tslint:disable */
namespace mongo {
    class JParse {
        constructor(str: string) {}
        @constant
        parseError(msg: std.str) {
            let ossmsg = new std.ostringstream;
            ossmsg ['<<'] (msg);
            ossmsg ['<<'] (": offset:")
            return ErrorCodes.FailedToParse, ossmsg.str();
        }
    }
}

declare namespace std {
    class vector<T> {
        constructor(arr: Array<T>);
        constructor(...arr: Array<T>);

        push_back(value: T): void;
        size(): int;

        [Symbol.iterator](): any;
    }
    
    export class cout {
        ['<<']: this;
    }
}

class AC {
    A: 10;
    B: 20;
    C: 30;
}
enum AAA {

}

Object.assign(A.prototype, AAA);

function mainz(): int {
    let v = new std.vector<int>(1,2,3);
    let c = cc.alloc(new std.vector<int>(1,2,3));
    console.log(c.size());
    cc.free(c);
    return 0;
}

function mainy(): int {
    cc.raii(() => {
        let v = new std.vector<int>(1,2,3);
        let c = cc.raii(new std.vector<int>(1,2,3));
        console.log(c.size());
    });
    return 0;
}

declare function struct(target: any);

function main(): int {
    let v = new std.vector([8, 3, 4, 5]);
    
    v.push_back(25);
    for (let n of v) {
        std.cout ['<<'] (n) ['<<'] ('\n');
    }

    return 0;
}

@struct class Foo {
    n: int;
    constructor() {
        std.cout ['<<']("static constructor\n");
    }
    destructor() {
        std.cout ['<<']("static destructor\n");
    }

    flush
}

new Foo()
namespace mongo {
    declare interface BSONObj{
        [Symbol.iterator](): Iterator<Ref<BSONElement>>;
    }
    type ComparisonRulesSet = number;
    class BSONElement{}
    namespace StringData {
        export interface ComparatorInterface{}
    }
    enum ComparisonRules {
        kIgnoreFieldOrder
    }
    declare class BSONObjIteratorSorted {
        constructor(obj: Ref<BSONObj>);
        more(): bool;
        next(): Ref<BSONElement>;
    }
    class BSONComparatorInterfaceBase<T> {
        hashCombineBSONObj(
            seed: Ref<size_t>,
            objToHash: ConstRef<BSONObj>,
            rules: ComparisonRulesSet,
            stringComparator: constant<Ptr<StringData.ComparatorInterface>>
        ): void {
            if (rules & ComparisonRules.kIgnoreFieldOrder) {
                let iter = new BSONObjIteratorSorted(objToHash);
                while (iter.more()) {
                    this.hashCombineBSONElement(seed, iter.next(), rules, stringComparator);
                }
            } else {
                for (let elem of objToHash['*']()) {
                    this.hashCombineBSONElement(seed, elem, rules, stringComparator);
                }
            }
        }
        hashCombineBSONElement(
            seed: Ref<size_t>,
            objToHash: constant<BSONElement>,
            rules: ComparisonRulesSet,
            stringComparator: constant<Ptr<StringData.ComparatorInterface>>
        ): void {}
    }
}

/** */
import {QApplication} from '<QtGui/QApplication>';
import {MainWindow} from './mainwindow';

function main(argc: int, argv: Ptr<char[]>): int {
    let a = new QApplication(argc, argv);
    let w = new MainWindow;
    w.show();
    return a.exec();
}