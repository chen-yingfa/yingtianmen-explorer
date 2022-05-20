import graph_utils

from shutil import copyfile

nodes_file = '../view-graph/data/nodes.json'
edges_file = '../view-graph/data/edges.json'
bu_nodes_file = '../view-graph/data/bu_nodes.json'
bu_edges_file = '../view-graph/data/bu_edges.json'

print('Loading from:', nodes_file, edges_file)
nodes = graph_utils.load_json(nodes_file)
edges = graph_utils.load_json(edges_file)
print('Dumping to:', bu_nodes_file, bu_edges_file)
graph_utils.dump_json(nodes, bu_nodes_file)
graph_utils.dump_json(edges, bu_edges_file)

# remove_ids = [
#     '386', '418', '200', '417', '420', '339', '402', '401', '360',
#     '416', '385', '424', '192', '297', '392', '381', '309', '219',
#     '280', '405', '411', '390', '393', '391', '387', '389', '388']
remove_ids = []

def get_edges(node_id):
    for edge in edges:
        if edge['src'] == node_id or edge['dst'] == node_id:
            yield edge

def get_node(node_id):
    for node in nodes:
        if node['id'] == node_id:
            return node
    return None


print('Removing nodes:', remove_ids)
for _id in remove_ids:
    nodes = [node for node in nodes if node['id'] != _id]
    edges = [edge for edge in edges if _id not in [edge['src'], edge['dst']]]


graph_utils.dump_json(nodes, nodes_file)
graph_utils.dump_json_indent_once(edges, edges_file)