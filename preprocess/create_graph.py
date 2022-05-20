import json

graph_file = '../view-graph/src/graph.js'

def dump_jsonl(jsonl: list, file: str):
    with open(file, 'w', encoding='utf8') as f:
        for j in jsonl:
            f.write(json.dumps(j, ensure_ascii=False) + '\n')


def load_graph_js(file):
    lines = open(file, 'r', encoding='utf8').readlines()
    lines[0] = '{'
    lines[-1] = '}'
    return eval(''.join(lines))

graph = load_graph_js(graph_file)

def clean_nodes(nodes):
    for i in range(len(nodes)):
        node = nodes[i]
        nodes[i] = {
            'id': node['data']['id'],
            'label': node['data']['name'],
            'type': node['data']['NodeType'],
            'description': None,
            'images': [],
            # 'pos': node['position'],
        }

def clean_edges(edges):
    for i in range(len(edges)):
        edge = edges[i]
        edges[i] = {
            'id': edge['data']['id'],
            'src': edge['data']['source'],
            'dst': edge['data']['target'],
            'label': edge['data']['name'],
            'type': edge['data']['interaction'],
        }


clean_nodes(graph['nodes'])
clean_edges(graph['edges'])
dump_jsonl(graph['nodes'], '../view-graph/data/nodes.json')
dump_jsonl(graph['edges'], '../view-graph/data/edges.json')