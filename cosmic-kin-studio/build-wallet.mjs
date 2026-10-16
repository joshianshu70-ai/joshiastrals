import fs from 'node:fs';
import {build} from 'esbuild';
fs.rmSync('public/vendor',{recursive:true,force:true});
await build({entryPoints:['wallet/appkit.js'],outdir:'public/vendor',entryNames:'wallet',bundle:true,splitting:true,format:'esm',platform:'browser',target:['es2022'],minify:true,define:{'process.env.NODE_ENV':'"production"'},logLevel:'info'});
