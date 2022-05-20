mtl_file = '../models/yingtianmen.mtl'

# Read the MTL file
text = ''
rm_strs = [
    'D:\\code\\school\\year4-2\\grad-design-ded\\data\\yingtianmen model\\',
    'D:\\code\\school\\year4-2\\grad-design-ded\\yingtianmen-explorer\\models\\',
]
for line in open(mtl_file, 'r', encoding='utf8'):
    for rm_str in rm_strs:
        if rm_str in line:
            prev = line
            line = line.replace(rm_str, '')
            print(f'{prev} -> {line}')
    text += line

# Dump
with open(mtl_file, 'w', encoding='utf8') as f:
    f.write(text)
