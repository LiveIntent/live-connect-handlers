import resolve from '@rollup/plugin-node-resolve'
import strip from '@rollup/plugin-strip'
import ts from '@rollup/plugin-typescript'
import cleaner from 'rollup-plugin-cleaner'
import mjsEntry from 'rollup-plugin-mjs-entry'
import dts from 'rollup-plugin-dts'
import commonjs from '@rollup/plugin-commonjs'

const OUTPUT_DIR = './dist'

export default [{
  input: './src/index.ts',
  output: [
    {
      file: `${OUTPUT_DIR}/index.js`,
      format: 'cjs'
    }
  ],
  plugins: [
    cleaner({ targets: [OUTPUT_DIR] }),
    ts({ tsconfig: './tsconfig.json' }),
    resolve(),
    commonjs(),
    strip(),
    mjsEntry() // https://nodejs.org/api/packages.html#packages_dual_commonjs_es_module_packages
  ]
}, {
  input: `${OUTPUT_DIR}/src/index.d.ts`,
  output: [{
    file: `${OUTPUT_DIR}/index.d.ts`,
    format: 'es'
  }],
  plugins: [dts()]
}]
