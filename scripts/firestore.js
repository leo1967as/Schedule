export async function saveScheduleToFirestore(db, currentUser, scheduleBody) {
    console.log('saveScheduleToFirestore', {db, currentUser, scheduleBody});
    if (!db) {
        alert('ไม่สามารถเชื่อมต่อฐานข้อมูล Firestore ได้');
        return;
    }
    if (!currentUser) return;
    const allBlocks = scheduleBody.querySelectorAll('.class-block');
    const scheduleData = Array.from(allBlocks).map(block => ({ ...block.dataset }));
    const userDocRef = db.collection('users').doc(currentUser);
    try {
        await userDocRef.set({ schedule: scheduleData });
        console.log("Schedule saved for", currentUser);
    } catch (error) {
        console.error("Error saving schedule: ", error);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
}

export async function loadScheduleFromFirestore(db, userId, scheduleBody, createClassBlock, setBlockIdCounter) {
    if (!db) {
        alert('ไม่สามารถเชื่อมต่อฐานข้อมูล Firestore ได้');
        return;
    }
    scheduleBody.querySelectorAll('.class-block').forEach(block => block.remove());
    const userDocRef = db.collection('users').doc(userId);
    try {
        const doc = await userDocRef.get();
        if (doc.exists) {
            const data = doc.data();
            const scheduleData = data.schedule || [];
            let maxId = 0;
            scheduleData.forEach(item => {
                createClassBlock(item);
                const idNum = parseInt(item.id.split('-').pop());
                if (idNum > maxId) maxId = idNum;
            });
            setBlockIdCounter(maxId);
        } else {
            console.log("No schedule found for this user, creating a new one.");
            setBlockIdCounter(0);
        }
    } catch (error) {
        console.error("Error loading schedule: ", error);
        alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    }
}

export async function saveTokenToFirestore(db, currentUser, token) {
    if (!db) {
        alert('ไม่สามารถเชื่อมต่อฐานข้อมูล Firestore ได้');
        return;
    }
    if (!currentUser) return;
    const userDocRef = db.collection('users').doc(currentUser);
    try {
        await userDocRef.update({
            notificationTokens: firebase.firestore.FieldValue.arrayUnion(token)
        });
        console.log('Token saved to Firestore.');
    } catch (error) {
        if (error.code === 'not-found' || error.code === 'invalid-argument') {
            await userDocRef.set({
                notificationTokens: [token]
            }, { merge: true });
            console.log('Token field created and token saved.');
        } else {
            console.error('Error saving token: ', error);
        }
    }
} 