// Offline tool launcher. Archived source keeps Python utilities out of web-app detection.
import {spawn} from 'node:child_process';import path from 'node:path';import {fileURLToPath} from 'node:url';
const [tool,...args]=process.argv.slice(2),allowed=['generate','optimize-images','prepare-opensea','prepare-seadrop-mapping'];
if(!allowed.includes(tool))throw Error('Choose an offline generator tool: '+allowed.join(', '));
const pack=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../cosmic-kin-generator-pack');
const script="import gzip,sys; from pathlib import Path; archive=Path(sys.argv[1]); source=archive.with_suffix(''); sys.argv=[str(source),*sys.argv[2:]]; exec(compile(gzip.decompress(archive.read_bytes()),str(source),'exec'),{'__name__':'__main__','__file__':str(source)})";
const child=spawn('python3',['-u','-c',script,path.join(pack,tool+'.py.gz'),...args],{stdio:'inherit'});
child.on('error',error=>{console.error(error.message);process.exitCode=1;});child.on('exit',code=>{process.exitCode=code??1;});
