// 这个文件会帮我们打包 packages 下的模块, 最终打包出 js 文件
// bun dev.js (要打包的名字 -f 打包的格式) === Bun.argv.slice(2)
import minimist from 'minimist'
import esbuild from 'esbuild'
import { resolve } from 'node:path'

const __dirname = import.meta.dir
// Bun 中的命令行参数通过 Bun.argv 来获取
const args = minimist(Bun.argv.slice(2))

const target = args._[0] || 'reactivity' // 打包哪个项目
const format = args.f || 'iife' // 打包后的模块化规范

// 入口文件 根据命令行参数提供的路径进行解析
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)

const pkg = resolve(__dirname, `../packages/${target}/package.json`)

esbuild
  .context({
    entryPoints: [entry], // 入口
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 出口
    bundle: true, // reactivity -> shared 会打包到一起
    platform: 'browser', // 打包后给浏览器使用
    sourcemap: true, // 可以调试源代码
    format, // cjs esm iife
    globalName: pkg.buildOptions?.name,
  })
  .then(ctx => {
    console.log('start dev')
    return ctx.watch()
  })
