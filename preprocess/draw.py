import networkx as nx
import matplotlib.pyplot as plt

import preprocess.graph_utils as graph_utils


def create_graph(graph_dict: dict):
    G = nx.Graph()

    pos_dict = {}
    label_dict = {}

    # Add nodes
    for node in graph_dict['nodes']:
        _id = int(node['data']['id'])
        label_dict[_id] = node['data']['name']
        pos_dict[_id] = (node['position']['x'], node['position']['y'])
        G.add_node(_id)

    # Add edges
    for node in graph_dict['edges']:
        _id = int(node['data']['id'])
        src = int(node['data']['source'])
        dst = int(node['data']['target'])
        edge_type = node['data']['interaction']
        G.add_edge(src, dst)
    
    pos_dict = nx.spring_layout(G, seed=0)
    fig, ax = plt.subplots()
    
    nx.draw(G, with_labels=True, labels=label_dict,
            pos=pos_dict,
            font_family="SimHei", font_size=8, ax=ax)
    plt.grid()
    plt.axis("on")
    # plt.xlim(-650, 650)
    # plt.ylim(-600, 600)
    ax.tick_params(left=True, bottom=True, labelleft=True, labelbottom=True)
    plt.title('知识图谱', font='SimHei', fontsize=14)
    plt.show()



graph_dict = graph_utils.load_graph_js()
create_graph(graph_dict)
