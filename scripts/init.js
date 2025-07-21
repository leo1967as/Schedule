export async function init({
    appContainer,
    loginScreen,
    currentUserDisplay,
    scheduleBody,
    currentClassContainer,
    currentClassTitle,
    currentClassTimer,
    nextClassContainer,
    nextClassTitle,
    nextClassTimer,
    viewerBanner,
    viewingUserName,
    editModeSwitch,
    setEditMode,
    loadScheduleFromFirestore,
    setupNotifications,
    updateCountdown,
    getCurrentUser,
    db,
    createClassBlock,
    setBlockIdCounter,
    firebase,
    notificationsBtn,
    saveTokenToFirestore,
    updateNotificationButton
}) {
    const urlParams = new URLSearchParams(window.location.search);
    const viewData = urlParams.get('view');
    const viewingUser = urlParams.get('user');
    if (viewData) {
        appContainer.classList.add('read-only');
        loginScreen.style.display = 'none';
        appContainer.style.display = 'block';
        viewerBanner.classList.remove('hidden');
        viewingUserName.textContent = decodeURIComponent(viewingUser) || 'ไม่ระบุชื่อ';
        try {
            const decodedData = decodeURIComponent(escape(atob(viewData)));
            const scheduleData = JSON.parse(decodedData);
            scheduleData.forEach(data => createClassBlock(data));
        } catch (e) {
            console.error("Error parsing shared data:", e);
            alert("ไม่สามารถโหลดข้อมูลที่แชร์มาได้ อาจเป็นเพราะลิงก์ไม่ถูกต้อง");
        }
        setInterval(() => updateCountdown(scheduleBody, currentClassContainer, currentClassTitle, currentClassTimer, nextClassContainer, nextClassTitle, nextClassTimer), 1000);
        updateCountdown(scheduleBody, currentClassContainer, currentClassTitle, currentClassTimer, nextClassContainer, nextClassTitle, nextClassTimer);
    } else {
        const currentUser = getCurrentUser();
        if (currentUser) {
            loginScreen.style.display = 'none';
            appContainer.style.display = 'block';
            currentUserDisplay.textContent = currentUser;
            await loadScheduleFromFirestore(db, currentUser, scheduleBody, createClassBlock, setBlockIdCounter);
            await setupNotifications(firebase, db, currentUser, notificationsBtn, saveTokenToFirestore, updateNotificationButton);
            setEditMode(false);
            setInterval(() => updateCountdown(scheduleBody, currentClassContainer, currentClassTitle, currentClassTimer, nextClassContainer, nextClassTitle, nextClassTimer), 1000);
            updateCountdown(scheduleBody, currentClassContainer, currentClassTitle, currentClassTimer, nextClassContainer, nextClassTitle, nextClassTimer);
        } else {
            loginScreen.style.display = 'flex';
            appContainer.style.display = 'none';
        }
    }
} 