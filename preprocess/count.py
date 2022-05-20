import json

nodes = json.load(open('../view-graph/data/nodes.json', 'r', encoding='utf8'))

print(len(nodes))