export type Point = [number, number];

export const debounce = (func: Function, wait: number) => {
    let timeout: any;
    const debounced = (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => {
        clearTimeout(timeout);
    };

    return debounced;
};
