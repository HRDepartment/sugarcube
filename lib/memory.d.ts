declare namespace std {
    class shared_ptr<T> {
        constructor(p: Ptr<T>);
        swap<Y>(other: Ref<shared_ptr<Y>>): void;
        reset(): void;
        reset<Y>(other: Ptr<Y>): void;
        get(): Ptr<T>;
        use_count(): long;
    }
    function make_shared<T extends Ptr<T>>(value: T): shared_ptr<T>;
}