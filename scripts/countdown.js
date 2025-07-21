export function updateCountdown(scheduleBody, currentClassContainer, currentClassTitle, currentClassTimer, nextClassContainer, nextClassTitle, nextClassTimer) {
    const now = new Date();
    const todayDay = now.getDay() === 0 ? 7 : now.getDay();
    const allClassesToday = Array.from(scheduleBody.querySelectorAll('.class-block'))
        .map(block => {
            const [startH, startM] = block.dataset.startTime.split(':');
            const [endH, endM] = block.dataset.endTime.split(':');
            return {
                name: block.dataset.name,
                day: parseInt(block.dataset.day),
                location: block.dataset.location,
                startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM),
                endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM)
            };
        })
        .filter(cls => cls.day === todayDay)
        .sort((a, b) => a.startTime - b.startTime);
    let currentClass = allClassesToday.find(cls => now >= cls.startTime && now < cls.endTime);
    let nextClass = allClassesToday.find(cls => now < cls.startTime);
    if (currentClass) {
        currentClassContainer.classList.remove('hidden');
        const diff = currentClass.endTime - now;
        const { hours, minutes, seconds } = formatTime(diff);
        currentClassTitle.innerHTML = `<div class="countdown-subject-info"><strong>${currentClass.name}</strong><span><br>${currentClass.startTime.toTimeString().substring(0, 5)} - ${currentClass.endTime.toTimeString().substring(0, 5)}</span><span><br><strong><u> > ${currentClass.location || ''}</u></span></div><small>จะสิ้นสุดใน</small>`;
        currentClassTimer.textContent = `${hours}:${minutes}:${seconds}`;
    } else {
        currentClassContainer.classList.add('hidden');
    }
    if (nextClass) {
        nextClassContainer.classList.remove('hidden');
        const diff = nextClass.startTime - now;
        const { hours, minutes, seconds } = formatTime(diff);
        nextClassTitle.innerHTML = `<div class="countdown-subject-info"><strong>${nextClass.name}</strong><span><br>${nextClass.startTime.toTimeString().substring(0, 5)} - ${nextClass.endTime.toTimeString().substring(0, 5)}</span><span><br><strong><u> > ${nextClass.location || ''}</u></span></div><small>จะเริ่มใน</small>`;
        nextClassTimer.textContent = `${hours}:${minutes}:${seconds}`;
    } else {
        nextClassContainer.classList.add('hidden');
    }
}

export function formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return { hours, minutes, seconds };
} 