export const LAYER_KEYS = ['express', 'arterial', 'local', 'service', 'pedestrian', 'nature', 'transit'];

export const LAYER_CONFIG = {
    express:    { weight: 1.8, color: "#1a1a1a", minScale: 0.00000 },
    arterial:   { weight: 1.1, color: "#3d3d3d", minScale: 0.00005 },
    local:      { weight: 0.7, color: "#3d3d3d", minScale: 0.00020 },
    service:    { weight: 0.7, color: "#3d3d3d", minScale: 0.00060 },
    nature:     { weight: 0.7, color: "#3d3d3d", minScale: 0.00090 },
    pedestrian: { weight: 0.7, color: "#3d3d3d", minScale: 0.00120 },
    transit:    { weight: 0.7, color: "#3d3d3d", minScale: 0.00070 }
};