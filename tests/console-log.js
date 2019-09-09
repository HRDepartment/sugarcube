const sugarc = require("../dist/index");

console.log(sugarc.transpileModule(`
    function main(): int {
        console.log("Hi!");
        return 0;
    }
`, undefined, '').outputText);

`#include <iostream>
int main() {
    std::cout << std::string("Hi!");
    return 0;
}`