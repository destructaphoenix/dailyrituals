#!/usr/bin/env python3
"""Verify captured baselines are genuinely dark-mode, stdlib only.

Exists because the first night attempt silently produced day screenshots (the
app's mode is its own setting, not the OS's) and four files were byte-identical
to their day twins. Never copy a 'night' capture again without proving it.
"""
import sys, zlib, struct, os

def mean_luma(path):
    data = open(path, 'rb').read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', f'{path}: not a PNG'
    pos, idat, w, h, depth, ctype = 8, b'', None, None, None, None
    while pos < len(data):
        ln = struct.unpack('>I', data[pos:pos+4])[0]
        typ = data[pos+4:pos+8]
        body = data[pos+8:pos+8+ln]
        if typ == b'IHDR':
            w, h, depth, ctype = struct.unpack('>IIBB', body[:10])
        elif typ == b'IDAT':
            idat += body
        elif typ == b'IEND':
            break
        pos += 12 + ln
    assert depth == 8 and ctype in (2, 6), f'{path}: unsupported PNG {depth}/{ctype}'
    nch = 3 if ctype == 2 else 4
    raw = zlib.decompress(idat)
    stride = w * nch
    prev = bytearray(stride)
    total, count, p = 0, 0, 0
    for _ in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p+stride]); p += stride
        for i in range(stride):                       # undo the PNG filter
            a = line[i-nch] if i >= nch else 0
            b = prev[i]
            c = prev[i-nch] if i >= nch else 0
            if f == 1:   line[i] = (line[i] + a) & 0xFF
            elif f == 2: line[i] = (line[i] + b) & 0xFF
            elif f == 3: line[i] = (line[i] + (a + b) // 2) & 0xFF
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 0xFF
        for i in range(0, stride, nch * 16):          # sample every 16th pixel
            total += line[i] + line[i+1] + line[i+2]
            count += 3
        prev = line
    return total / count

fail = False
for f in sorted(sys.argv[1:]):
    luma = mean_luma(f)
    ok = luma < 90                                    # night-v2 is true black
    print(f'{"ok  " if ok else "FAIL"}  {os.path.basename(f):28s} mean luma {luma:6.1f}')
    if not ok:
        fail = True
sys.exit(1 if fail else 0)
