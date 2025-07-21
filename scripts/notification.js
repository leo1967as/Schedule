export async function setupNotifications(firebase, db, currentUser, notificationsBtn, saveTokenToFirestore, updateNotificationButton) {
    try {
        // รอให้ service worker พร้อมก่อน
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            await navigator.serviceWorker.ready;
        }
        const messaging = firebase.messaging();
        const currentToken = await messaging.getToken({ vapidKey: 'BDMTIb2DErhAzW9wzREcxfQb-c5vbA39q8OZqQewh-aQtshlT90koKsUVgxezcCwA91HIio1pcqqyaa6ecFOqBk' });
        if (currentToken) {
            console.log('FCM Token:', currentToken);
            await saveTokenToFirestore(db, currentUser, currentToken);
            updateNotificationButton(notificationsBtn, true);
        } else {
            console.log('No registration token available. Request permission to generate one.');
            updateNotificationButton(notificationsBtn, false);
        }
    } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
        notificationsBtn.textContent = 'การแจ้งเตือนมีปัญหา';
        notificationsBtn.disabled = true;
    }
}

export async function cancelNotifications(firebase, db, currentUser, notificationsBtn, updateNotificationButton) {
    try {
        // รอให้ service worker พร้อมก่อน
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
            await navigator.serviceWorker.ready;
        }
        const messaging = firebase.messaging();
        const currentToken = await messaging.getToken({ vapidKey: 'BDMTIb2DErhAzW9wzREcxfQb-c5vbA39q8OZqQewh-aQtshlT90koKsUVgxezcCwA91HIio1pcqqyaa6ecFOqBk' });
        if (currentToken) {
            // 1. Unsubscribe from push
            await messaging.deleteToken(currentToken);
            // 2. Remove token from Firestore
            if (currentUser) {
                const userDocRef = db.collection('users').doc(currentUser);
                await userDocRef.update({
                    notificationTokens: firebase.firestore.FieldValue.arrayRemove(currentToken)
                });
            }
            updateNotificationButton(notificationsBtn, false);
            notificationsBtn.textContent = 'ปิดการแจ้งเตือนแล้ว';
            notificationsBtn.disabled = false;
        } else {
            updateNotificationButton(notificationsBtn, false);
        }
    } catch (err) {
        console.error('Error cancelling notifications:', err);
        notificationsBtn.textContent = 'ยกเลิกแจ้งเตือนไม่สำเร็จ';
        notificationsBtn.disabled = false;
    }
}

export function updateNotificationButton(notificationsBtn, isSubscribed) {
    if (isSubscribed) {
        notificationsBtn.textContent = 'ปิดการแจ้งเตือน';
        notificationsBtn.disabled = false;
    } else {
        notificationsBtn.textContent = 'เปิดการแจ้งเตือน';
        notificationsBtn.disabled = false;
    }
} 