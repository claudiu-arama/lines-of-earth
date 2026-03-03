export type Point = [number, number];

export const debounce = (func: Function, wait: number) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// export const throttle =;