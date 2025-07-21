export function shareSchedule(shareUrlInput, shareModal, currentUser) {
    const allBlocks = document.querySelectorAll('.class-block');
    const scheduleData = Array.from(allBlocks).map(block => ({ ...block.dataset }));
    const jsonString = JSON.stringify(scheduleData);
    const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?view=${encodedData}&user=${encodeURIComponent(currentUser)}`;
    shareUrlInput.value = shareUrl;
    shareModal.querySelector('.close-btn').onclick = () => shareModal.classList.remove('show');
    shareModal.classList.add('show');
}

export function copyUrl(shareUrlInput, copyUrlBtn) {
    shareUrlInput.select();
    document.execCommand('copy');
    copyUrlBtn.textContent = 'คัดลอกแล้ว!';
    setTimeout(() => { copyUrlBtn.textContent = 'คัดลอกลิงก์'; }, 2000);
} 