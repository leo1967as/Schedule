export function getCurrentUser() {
    return localStorage.getItem('currentScheduleAppUser');
}

export function setCurrentUser(userId) {
    localStorage.setItem('currentScheduleAppUser', userId);
}

export function clearCurrentUser() {
    localStorage.removeItem('currentScheduleAppUser');
} 