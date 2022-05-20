export const NODE_COLOR_FOCUS = '#ed6666';
export const NODE_COLOR_HOVER = '#eeaa66';
export const EDGE_COLOR_FOCUS = 'rgba(150, 70, 30, 0.5)';
export const EDGE_COLOR_HOVER = 'rgba(140, 120, 40, 0.5)';
export const EDGE_COLOR = 'rgba(0, 0, 0, 0.2)';
export const DEFAULT_NODE_COLOR = '#888888';
export const DEFAULT_NODE_TEXT_COLOR = 'rgba(255, 255, 255, 0.6)';
export const ALPHA_FAR_NODES = 0.17;

export const nodeTypeToColor = {
    '建筑风格元素': 'rgba(238, 34, 102, 0.8)',
    // '风格': '#88ee88',
    '风格': 'rgba(136, 238, 136, 0.8)',
    '斗拱': 'rgba(221, 85, 85, 0.8)',
    '城门': 'rgba(85, 221, 85, 0.8)',
    '台基、墙面、地面': 'rgba(85, 85, 221, 0.8)',
    '柱子': 'rgba(221, 221, 85, 0.8)',
    '门窗': 'rgba(221, 85, 221, 0.8)',
    '天花': 'rgba(85, 221, 221, 0.8)',
    '彩画、色彩': 'rgba(187, 187, 187, 0.8)',
    '纹样': 'rgba(70, 70, 70, 0.8)',
    '发掘成果': 'rgba(170, 135, 20, 0.8)',
    '文物遗存': 'rgba(23, 200, 100, 0.8)',
    '后世纪念': 'rgba(50, 135, 240, 0.8)',
    '建筑物': 'rgba(220, 220, 220, 0.8)',
    '朝代': 'rgba(70, 135, 100, 0.8)',
    '属性': 'rgba(80, 80, 100, 0.8)',
    '实体类型': 'rgba(100, 20, 140, 0.8)',
}

// Camera of graph view
export const ORIG_NODE_RADIUS = 20;
export const ORIG_STROKE_WIDTH = 8;
export const ORIG_WORLD_VIEW_AREA = 10000;
export const HOME_NODE_ID = '应天门';