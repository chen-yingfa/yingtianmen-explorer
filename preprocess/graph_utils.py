import json

GRAPH_JS_FILE = '../view-graph/src/graph.js'
NODES_FILE = '../view-graph/data/nodes.json'
EDGES_FILE = '../view-graph/data/edges.json'
NODES_FILE_PROCESSED = './data/nodes.jsonl'
EDGES_FILE_PROCESSED = './data/edges.jsonl'

def load_json(file): 
    return json.load(open(file, 'r', encoding='utf8'))

def dump_json(data, file):
    json.dump(data, open(file, 'w', encoding='utf8'), ensure_ascii=False, indent=2)

def dump_json_indent_once(data, file):
    with open(file, 'w', encoding='utf8') as f:
        f.write('[\n')
        for d in data[:-1]:
            f.write(json.dumps(d, ensure_ascii=False) + ',\n')
        f.write(json.dumps(data[-1], ensure_ascii=False) + '\n')
        f.write(']\n')

def dump_jsonl(jsonl: list, file: str):
    with open(file, 'w', encoding='utf8') as f:
        for j in jsonl:
            f.write(json.dumps(j, ensure_ascii=False) + '\n')

def load_jsonl(file: str=None):
    with open(file, 'r', encoding='utf8') as f:
        return [json.loads(line) for line in f if len(line.strip()) > 0]

def dumps_jsonl(jsonl: list):
    return '\n'.join([json.dumps(j, ensure_ascii=False) for j in jsonl])

def loads_jsonl(s: str):
    return [json.loads(line) for line in s.split('\n')]

def load_graph_js(file=None):
    if file is None:
        file = GRAPH_JS_FILE
    lines = open(file, 'r', encoding='utf8').readlines()
    lines[0] = '{'
    lines[-1] = '}'
    return eval(''.join(lines))

def dump_graph_js(nodes, edges, file=None):
    graph = {
        'nodes': nodes,
        'edges': edges,
    }
    graph_str = json.dumps(graph, indent=4, ensure_ascii=False)
    graph_str = 'export const graphData = ' + graph_str + ';'
    with open(file, 'w', encoding='utf8') as f:
        f.write(graph_str)


def load_nodes(): return load_json(NODES_FILE)
def load_edges(): return load_json(EDGES_FILE)
def save_processed_nodes(nodes): dump_json(nodes, NODES_FILE_PROCESSED)
def save_processed_edges(edges): dump_json(edges, EDGES_FILE_PROCESSED)
