#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 - "${ANDROID_TOOLCHAIN:-/workspace/android-toolchain}" <<'PY'
import sys,pathlib,json,hashlib,urllib.request,zipfile,os
root=pathlib.Path(sys.argv[1]);root.mkdir(parents=True,exist_ok=True)
for item in json.loads(pathlib.Path('toolchain.json').read_text())['downloads']:
 p=root/item['file']
 if not p.exists():
  partial=p.with_suffix(p.suffix+'.download')
  urllib.request.urlretrieve(item['url'],partial)
  if hashlib.sha256(partial.read_bytes()).hexdigest()!=item['sha256']:
   raise SystemExit('Checksum failed: '+item['file'])
  partial.rename(p)
 if hashlib.sha256(p.read_bytes()).hexdigest()!=item['sha256']:
  raise SystemExit('Cached checksum failed: '+item['file'])
 if item['extract_to']:
  destination=root/item['extract_to']
  with zipfile.ZipFile(p) as z:
   for entry in z.infolist():
    target=(destination/entry.filename).resolve()
    if not str(target).startswith(str(destination.resolve())+os.sep):
     raise SystemExit('Unsafe archive path')
    if target.is_file():
     if hashlib.sha256(target.read_bytes()).digest()!=hashlib.sha256(z.read(entry)).digest():
      raise SystemExit('Existing tool differs; preserve it and choose another ANDROID_TOOLCHAIN: '+str(target))
   z.extractall(destination)
   for entry in z.infolist():
    if not entry.is_dir() and (entry.external_attr>>16)&0o111:os.chmod(destination/entry.filename,0o755)
 print(item['file']+' verified')
PY
