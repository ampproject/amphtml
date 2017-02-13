def extractExtern(line):
  #remove ';'
  if line.endswith(';'):
    line = line[:-1]
  list = line.split()
  for word in list:
    # 1. Get all variables with data.
    elements = word.split('(');
    for ele in elements:
      if ele.startswith('data.'):
        print ele.split(')')[0]
    # 2. Get all variable start with global.
    if word.startswith('global.'):
      word = word[7:]
      elements = word.split('.')
      buf = ''
      for ele in elements:
        ele = ele.split('(')[0]
        if buf == '':
          print 'var ' + ele
        else:
          print buf + ele
        buf = buf + ele + '.'
    # 3. Get all variable start with window.
    if word.startswith('window.'):
      elements = word.split('.')
      buf = ''
      for ele in elements:
        ele = ele.split('(')[0]
        if ele != 'window':
          print buf + ele
        buf = buf + ele + '.'
  return line

filename = "../ads/ezoic.js"
file = open(filename, 'r')
isCommentLine = False
for line in file:
  line = ' '.join(line.split())
  if '/*' in line:
    isCommentLine = True
  if not isCommentLine and '//' not in line:
    newline = extractExtern(line)
    #print newline
  if '*/' in line:
    isCommentLine = False

