import os
from os import listdir
terms = []
def extractExtern(line):
  #remove ';'
  if line.endswith(';') or line.endswith(','):
    line = line[:-1]
  list = line.split()
  for word in list:
    # 1. Only support extracting data.xxx now.
    elements = word.split('(');
    for ele in elements:
      if ele.startswith('data.'):
        term = ele.split('(')[0]
        term = term.split(')')[0]
        term = term.split('[')[0]
        term = term.split(']')[0]
        term = term.split(',')[0]
        if term not in terms:
          terms.append(term)
          writeFile.write(term + ';' + '\n')
    # # 2. Get all variable start with global.
    # if word.startswith('global.'):
    #   word = word[7:]
    #   elements = word.split('.')
    #   buf = ''
    #   for ele in elements:
    #     ele = ele.split('(')[0]
    #     if buf == '':
    #       print 'var ' + ele
    #     else:
    #       print buf + ele
    #     buf = buf + ele + '.'
    # # 3. Get all variable start with window.
    # if word.startswith('window.'):
    #   elements = word.split('.')
    #   buf = ''
    #   for ele in elements:
    #     ele = ele.split('(')[0]
    #     if ele != 'window':
    #       print buf + ele
    #     buf = buf + ele + '.'

prefix = '../ads/'
allFiles = os.listdir(prefix)
writeFile = open(prefix + 'ads.extern.js', 'a')
for filename in allFiles:
  if filename == 'ads.extern.js':
    continue
  if filename.endswith('js') and not filename.startswith('_'):
    writeFile.write('// ' + filename + '\n')
    file = open(prefix + filename, 'r')
    isCommentLine = False
    for line in file:
      line = ' '.join(line.split())
      if '/*' in line:
        isCommentLine = True
      if not isCommentLine and '//' not in line:
        extractExtern(line)
      if '*/' in line:
        isCommentLine = False
    writeFile.write('\n')
  else:
    continue


