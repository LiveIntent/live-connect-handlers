import strip from '@rollup/plugin-strip'
import ts from '@rollup/plugin-typescript'
import cleaner from 'rollup-plugin-cleaner'
import mjsEntry from 'rollup-plugin-mjs-entry'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const OUTPUT_DIR = './dist'

export default {
    input: './src/index.ts',
    output: [
        {
            file: `${OUTPUT_DIR}/index.js`,
            format: 'cjs',
            sourcemap: true
        }
    ],
    plugins: [
        cleaner({ targets: [OUTPUT_DIR] }),
        ts(),
        resolve(),
        commonjs({ sourceMap: true }),
        strip(),
        mjsEntry() // https://nodejs.org/api/packages.html#packages_dual_commonjs_es_module_packages
    ]
}
