import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
test('built single-file app remains valid classic JavaScript including asynchronous PDF export',async()=>{const html=await readFile(new URL('豆格.html',import.meta.url),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);assert.doesNotThrow(()=>new Script(script));assert.ok(script.includes('async function createImagePDF'));assert.ok(html.includes('id="download-vector-pdf"'));});
