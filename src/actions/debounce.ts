export function debounce(func, waitFor) {
    let timeout;

    return function (...args) {
        // Use a closure to store the resolve/reject methods of the currently pending promise
        let pendingPromiseResolve, pendingPromiseReject;

        // Clear the existing timeout if the function is called again
        if (timeout) {
            clearTimeout(timeout);
        }

        // Set a new timeout
        timeout = setTimeout(() => {
            // When the timeout fires, invoke the function and resolve/reject the pending promise
            func(...args).then(pendingPromiseResolve).catch(pendingPromiseReject);
        }, waitFor);

        // Return a new promise that will be resolved/rejected when the timeout fires
        return new Promise((resolve, reject) => {
            pendingPromiseResolve = resolve;
            pendingPromiseReject = reject;
        });
    };
}
