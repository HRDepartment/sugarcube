declare namespace std {
    class basic_string<CharT> {
        
    }

    type _String = basic_string<string>;
    export const string: {
        new(): _String;
        new(str: string): _String;
    };
}

declare namespace cc {
    function str<StringT=std._String>(strings: string[], ...keys: string[]): StringT;
}