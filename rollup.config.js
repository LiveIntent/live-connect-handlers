import strip from '@rollup/plugin-strip'
import ts from '@rollup/plugin-typescript'
import cleaner from 'rollup-plugin-cleaner'
import dts from 'rollup-plugin-dts'
import {del} from '@kineticcafe/rollup-plugin-delete'

const OUTPUT_DIR = './dist'

export default [{
    input: './src/index.ts', output: [{
        dir: OUTPUT_DIR,
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name]-[hash].cjs',
        format: 'cjs',
        sourcemap: false
    }, {
        dir: OUTPUT_DIR,
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name]-[hash].mjs',
        format: 'es',
        sourcemap: false
    }], plugins: [cleaner({targets: [OUTPUT_DIR]}), ts({
        compilerOptions: {
            outDir: OUTPUT_DIR, declarationDir: `${OUTPUT_DIR}/dts`,
        }
    }), strip()], external: ['live-connect-common', 'js-cookie']
}, {
    input: `${OUTPUT_DIR}/dts/src/index.d.ts`,
    output: [{file: `${OUTPUT_DIR}/index.d.ts`, format: 'es'}],
    plugins: [dts(), del({targets: `${OUTPUT_DIR}/dts`, hook: 'buildEnd'})],
}]
