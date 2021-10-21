import json
import os

DEFAULT = "en.json"
DESCRIPTIONS = "descriptions.json"

if __name__ == "__main__":
  descriptions = dict()
  contents = dict()
  with open(DEFAULT) as f:
    contents = json.load(f)
    contents = {int(x): y["description"] for x, y in contents.items()}
  with open(DESCRIPTIONS, "w", encoding="utf8") as f:
    json.dump(contents, f, indent=2, ensure_ascii=False)
  fileNames = [x for x in os.listdir(".") if x[-5:] == ".json"]
  for name in fileNames:
    contents = dict()
    with open(name, "r", encoding="utf8") as f:
      contents = json.load(f)
      if type(contents[list(contents.keys())[0]]) == dict:
        contents = {int(x): y["string"] for x, y in contents.items()}
    with open(name, "w", encoding="utf8") as f:
      json.dump(contents, f, indent=2, ensure_ascii=False)
