// Time elapsed display for notification - helps with time blindness
export function getTimeElapsed(startTime: number): string {
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMins = minutes % 60;
        return `${hours}h ${remainingMins}m elapsed`;
    }
    return `${minutes}m elapsed`;
}

// Time remaining display
export function getTimeRemaining(endTime: number): string {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return "Time's up!";

    const minutes = Math.floor(remaining / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMins = minutes % 60;
        return `${hours}h ${remainingMins}m left`;
    }
    return `${minutes}m left`;
}

// Gentle time pressure indicator (no panic)
export function getTimeColor(remaining: number, total: number): string {
    const percentLeft = (remaining / total) * 100;

    if (percentLeft > 50) return '#10b981'; // Green - plenty of time
    if (percentLeft > 25) return '#f59e0b'; // Amber - getting close
    return '#8b5cf6'; // Purple (not red!) - wind down time
}
