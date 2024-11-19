export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): T {
    let inThrottle: boolean;
    let lastResult: ReturnType<T>;

    return ((...args: Parameters<T>): ReturnType<T> => {
        if (!inThrottle) {
            inThrottle = true;
            lastResult = func(...args);
            setTimeout(() => (inThrottle = false), limit);
        }
        return lastResult;
    }) as T;
}
