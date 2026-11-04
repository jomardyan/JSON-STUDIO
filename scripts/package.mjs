import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';

const dist = new URL('../dist/', import.meta.url);
const archive = new JSZip();
async function addDirectory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(encodeURIComponent(entry.name), directory);
    const name = prefix + entry.name;
    if (entry.isDirectory()) await addDirectory(new URL(path.href + '/'), name + '/');
    else if (entry.isFile()) archive.file(name, await readFile(path));
    else throw new Error(`Unsupported build entry: ${name}`);
  }
}
// A missing production build fails before creating an incomplete archive.
await readFile(new URL('index.html', dist));
await addDirectory(dist);
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const release = new URL('../release/', import.meta.url);
await mkdir(release, { recursive: true });
const output = new URL(`json-studio-${version}.zip`, release);
await writeFile(output, await archive.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log(`Package created: ${fileURLToPath(output)}`);
