import networkx as nx
import matplotlib.pyplot as plt

import graph_utils

nodes = graph_utils.load_nodes()
edges = graph_utils.load_edges()


def get_nx_graph(nodes: list, edges: list) -> nx.Graph:
    G = nx.Graph()
    # Add nodes
    for node in nodes:
        _id = node['id']
        G.add_node(_id, label=node['label'])

    # Add edges
    for edge in edges:
        src = edge['src']
        dst = edge['dst']
        G.add_edge(src, dst)
    return G

def get_label_dict(nodes: list) -> dict:
    return {n['id']: n['label'] for n in nodes}

def get_pos_dict(graph: nx.Graph, world_scale: int) -> dict:
    pos_dict = nx.spring_layout(graph, seed=0)
    for k in pos_dict:
        pos_dict[k] *= world_scale
    return pos_dict


def draw_graph(nodes: list, edges: list, world_scale: int=100):
    G = get_nx_graph(nodes, edges)

    # Update node positions with spring layout
    pos_dict = get_pos_dict(G, world_scale)
    node_dict = {node['id']: node for node in nodes}
    for node_id, pos in pos_dict.items():
        node_dict[node_id]['pos'] = {'x': pos[0], 'y': pos[1]}
        node_dict[node_id]['description'] = '<br><br>'.join(node_dict[node_id]['description'])
    graph_utils.save_processed_nodes(nodes)  # Save

    # Save to website's graph.js
    graph_utils.dump_graph_js(nodes, edges, '../view-graph/src/graphData.js')

    # Plot graph with matplotlib
    label_dict = get_label_dict(nodes)
    fig, ax = plt.subplots()
    nx.draw(G, with_labels=True, labels=label_dict,
            pos=pos_dict,
            font_family="SimHei", font_size=8, ax=ax)
    plt.grid()
    plt.axis("on")
    ax.tick_params(left=True, bottom=True, labelleft=True, labelbottom=True)
    plt.title('知识图谱', font='SimHei', fontsize=14)
    plt.savefig('graph.png')

draw_graph(nodes, edges)