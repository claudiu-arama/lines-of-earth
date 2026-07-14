export const BLURRED_PLACEHOLDER = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAATADIBAREA/8QAQAABAQACAwAAAAAAAAAAAAAABwgGCQEEChAAAwEBAAEEAgEDBQAAAAAAAgMEAQURAAYSEwcUIhUhQSQxUZHR/9oACAEBAAA/APc1+Tes/icqC2O8ZKXVU8xCNZqm3HbBQWLRoGtmMnNAVEYFn1LSbDLBzd9S9R7w9y9Uc4/uRvUkZzNf8w7BYyp4T46dLErmc1zPma8oCl5K2ycj02P8B4Mm9ioObdFX12q9v/ubVop3GvVUKGZRAWGaBAB1QuOzcOgNsezMPF/D0dB7vgkpt6VPexCt57skXZWa0Sr+wFOlNiaiw/MKjWnMKl17GqwvC9AnUH7I/K/dRzVc47relyAQqmGKR2QNDGNV9U/3hH9rJlYTNdMmg0u36t8Ao/BIXtf3n7it90b0XdTpvmhCv6+UAL2fqx12qpisqo+gf02nGLQGVhqH4KYA60laoquXZOwAPN3MMBPMJRYWYWZuYWb/AHws8+Nzf8+hn84Kpo4vKEZDCGC0+x0O9prWjirnXkq/mbNxYbT+4ZG4/AzrRrfizfAbG91evU520Dl9VH7ja7DhOPoxyR1BUmt/w6FAmaJloQMv2jhapB6rGHvoX96c7pdEEzh2akG+YRXPzzvhp5WPP70vn/WxdLwBI6rCKgpcBDVO3U/WWm3A/H9WJp6LE9ijnzngRVqf5oeuVoo0jVeeSXHS4ya1HwxZ5j1rmbWpBbQvtZLYgnbNy+QNeHClo+5Ok/qfSmVjHdOXnAiTnKWpsmFrmULtavNn/wBEWr+7Ln/CnI5NXDq6iIbJGOs+q9L7TulbdPiizee86mn/AE9SdWlc78FgZ5mbhfT5Y8fUv/Clf9D/AO+uGoTSk5qFLfO8GKcloCxTVEPglsAs0TDc3fIlm561/fm3k832p77/AEPbkaeRG/J62Tx5oL17I2kRBhaX1B80LMEq0ErZhMWsTYwjI/yVU/l2e1UwHk4dCnnBb4ADOgARaYixjRNmj82Hujh5hef5ZuYPjIfbyF71dl/nk4ciXogkGtABtqpNdNA4B58TcKwxnjwJaPy0fnu7uZ9Lj82ZXAaiUQLOzwViOscahDo1uVcAINhIAaQAfswV5nzzGZ4Z/L1sCgnRJJHNMlaJ0oSKkqDAWGfAd3BEczM87u7u/wC+7u7u7u+u/wDAf+PX/9k='

export const FRAME_ASPECT_RATIO = 70 / 50;

export const MOBILE_MAX_WIDTH = 768;

export const FETCH_TIMEOUT_MS = 95000;

export const COLOR_PRESETS = [
    "#ffffff", "#f8f8f8", "#f5f7fa", "#f5f0e8", "#fffbe6", "#ffe6f2", "#eeedf8", "#e9f5fb", "#edf7ef", "#fdf6e3",
    "#fce8e8", "#fad1d1", "#ebadad", "#e08585", "#e05252", "#e63946", "#d4504a", "#cc3333", "#c0392b", "#7a1f1f",
    "#fce9cf", "#fad49e", "#f2c88c", "#e89c30", "#f2740d", "#e8a020", "#b5451b", "#8b3a2a",
    "#5a4a35", "#3d3020", "#1a1008", "#fff7cc", "#ffee99", "#ffe14c", "#f6ce55", "#f9a806", "#f0a500", 
    "#e8c547", "#e8d5a3", "#ebd6ad", "#9a8a7a", "#8a7a65",
    "#edfccf", "#d8f0a8", "#c4e87d", "#99d742", "#66b814", "#4d8e0b", "#446600",
    "#dbf0df", "#b8e0be", "#94d19e", "#c8d8a0", "#6b9e6b", "#339944", "#1b7e2b", "#4a7c59", "#2d6e4e", 
    "#2d5a27", "#3d6b35", "#00a060", "#004d0d", "#1e2d1e",
    "#cce8f4", "#b8e0dc", "#5ebab1", "#12a192", "#056156", "#d1f6fa", "#7ddde8", "#33bdcc", "#008a99", 
    "#00f0c0", "#008a70", "#005040",
    "#b8d4e8", "#a8d4e8", "#a8c8e8", "#9bbfd4", "#7eb8d4", "#6a9ab8", "#5a9ab5", "#5b8fa8", "#4a8fa8", 
    "#4a7a9b", "#2a5f8f", "#0a4a6e", "#1a3a4a", "#b0d5e8", "#61acd1", "#3488b2", "#2d6886",
    "#d6e0f5", "#88a4dd", "#5379c6", "#4b659b", "#3a4f78", "#dedaf1", "#bdb5e3", "#9e94d1", "#6659a6", 
    "#4b3d8f", "#3c2d86",
    "#ffcce6", "#e085b3", "#e05299", "#cc3380", "#ff2d78", "#8b2252", "#1a0a10",
    "#e0e8f0", "#c0c8d0", "#90a0b0", "#607080", "#405060", "#2a3540", "#4a3a40", "#6a5a60", "#7a6a70", "#3a2a30",
    "#ede6de", "#e6e6e6", "#c8c4b8", "#d0d0d0", "#b3b3b3", "#999999", "#888888", "#808080", "#707070", "#666666", 
    "#555555", "#404040", "#333333",  "#2c2c2c", "#2a2a2a", "#1a1a2e", "#222222", "#1a1a1a", "#111111", "#0a0a1a", 
    "#0f1923", "#0a0a0a"
];

export const SCALE_BASE = 0.005;
