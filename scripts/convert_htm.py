import sys
import os
import re

def convert_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    code = re.sub(r"import\s+\{\s*html\s*\}\s+from\s+['\"]htm/preact['\"];?\n?", "", code)
    
    out = []
    i = 0
    n = len(code)
    
    def process_html_literal(start_idx):
        res = ["("]
        idx = start_idx
        stack = ['html']
        
        while idx < n and len(stack) > 0:
            c = code[idx]
            state = stack[-1]
            
            if state == 'html':
                if c == '`':
                    res.append(')')
                    stack.pop()
                    idx += 1
                    break
                elif c == '$' and idx+1 < n and code[idx+1] == '{':
                    res.append('{')
                    stack.append('expr')
                    idx += 2
                elif c == '<' and idx+3 < n and code[idx:idx+4] == '<!--':
                    res.append('{/*')
                    stack.append('comment')
                    idx += 4
                else:
                    res.append(c)
                    idx += 1
            elif state == 'comment':
                if c == '-' and idx+2 < n and code[idx:idx+3] == '-->':
                    res.append('*/}')
                    stack.pop()
                    idx += 3
                else:
                    res.append(c)
                    idx += 1
            elif state == 'expr':
                if c == '}':
                    res.append('}')
                    stack.pop()
                    idx += 1
                elif c == '`':
                    res.append(c)
                    stack.append('template')
                    idx += 1
                elif c == "'":
                    res.append(c)
                    stack.append('sq')
                    idx += 1
                elif c == '"':
                    res.append(c)
                    stack.append('dq')
                    idx += 1
                elif c == '{':
                    res.append(c)
                    stack.append('expr')
                    idx += 1
                else:
                    res.append(c)
                    idx += 1
            elif state == 'template':
                if c == '`':
                    res.append(c)
                    stack.pop()
                    idx += 1
                elif c == '$' and idx+1 < n and code[idx+1] == '{':
                    res.append('${')
                    stack.append('expr')
                    idx += 2
                elif c == '\\':
                    res.append(c)
                    idx += 1
                    if idx < n:
                        res.append(code[idx])
                        idx += 1
                else:
                    res.append(c)
                    idx += 1
            elif state == 'sq':
                if c == "'":
                    res.append(c)
                    stack.pop()
                    idx += 1
                elif c == '\\':
                    res.append(c)
                    idx += 1
                    if idx < n:
                        res.append(code[idx])
                        idx += 1
                else:
                    res.append(c)
                    idx += 1
            elif state == 'dq':
                if c == '"':
                    res.append(c)
                    stack.pop()
                    idx += 1
                elif c == '\\':
                    res.append(c)
                    idx += 1
                    if idx < n:
                        res.append(code[idx])
                        idx += 1
                else:
                    res.append(c)
                    idx += 1
        
        return "".join(res), idx

    while i < n:
        if code[i:i+5] == 'html`':
            html_str, next_i = process_html_literal(i+5)
            
            html_str = re.sub(r'<(input|img|hr|br|meta|link)([^>]*?)(?<!/)>', r'<\1\2 />', html_str, flags=re.IGNORECASE)
            html_str = re.sub(r'\{([^}]+)\s*\?\s*[\'"]checked[\'"]\s*:\s*[\'"][\'"]\}', r'checked={!!(\1)}', html_str)
            html_str = re.sub(r'\{([^}]+)\s*\?\s*[\'"]selected[\'"]\s*:\s*[\'"][\'"]\}', r'selected={!!(\1)}', html_str)
            html_str = re.sub(r'\{([^}]+)\s*\?\s*[\'"]disabled[\'"]\s*:\s*[\'"][\'"]\}', r'disabled={!!(\1)}', html_str)

            out.append(html_str)
            i = next_i
        else:
            if code[i] == "'":
                out.append("'")
                i += 1
                while i < n and code[i] != "'":
                    if code[i] == '\\':
                        out.append(code[i])
                        i += 1
                        if i < n:
                            out.append(code[i])
                            i += 1
                    else:
                        out.append(code[i])
                        i += 1
                if i < n:
                    out.append("'")
                    i += 1
            elif code[i] == '"':
                out.append('"')
                i += 1
                while i < n and code[i] != '"':
                    if code[i] == '\\':
                        out.append(code[i])
                        i += 1
                        if i < n:
                            out.append(code[i])
                            i += 1
                    else:
                        out.append(code[i])
                        i += 1
                if i < n:
                    out.append('"')
                    i += 1
            elif code[i] == '`':
                out.append('`')
                i += 1
                while i < n and code[i] != '`':
                    if code[i] == '\\':
                        out.append(code[i])
                        i += 1
                        if i < n:
                            out.append(code[i])
                            i += 1
                    else:
                        out.append(code[i])
                        i += 1
                if i < n:
                    out.append('`')
                    i += 1
            else:
                out.append(code[i])
                i += 1
                
    with open(filepath.replace('.js', '.jsx'), 'w', encoding='utf-8') as f:
        f.write("".join(out))
    
    print(f"Converted {filepath}")

for file in sys.argv[1:]:
    convert_file(file)
