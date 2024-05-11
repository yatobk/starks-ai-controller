import { setTimeout, clearTimeout } from 'timers';

export function debounce(func, waitFor) {
    const timeouts = {};
    return function (identifier, ...args) {
        return new Promise((resolve, reject) => {

            if (timeouts[identifier]) {
                clearTimeout(timeouts[identifier]);
            }
            timeouts[identifier] = setTimeout(() => {

                try {
                    const result = func(...args);
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    delete timeouts[identifier];
                }
            }, waitFor);
        });
    };
}
