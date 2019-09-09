import * as sugarc from '../index';

function stdin() {
    return new Promise<string>((resolve) => {
        let data = '';

        process.stdin.setEncoding('utf-8');
        process.stdin.on('readable', () => {
            while (data += process.stdin.read()) {/*not empty*/}
        });
        process.stdin.on('end', () => resolve(data));
    });
}

stdin().then((data) => process.stdout.write(sugarc.transpileModule(data).outputText));
