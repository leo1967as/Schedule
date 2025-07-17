document.addEventListener('DOMContentLoaded', () => {
    // --- 1. ส่วนของ DOM Elements ---
    const modal = document.getElementById('add-class-modal');
    const addClassBtn = document.getElementById('add-class-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('add-class-form');
    const deleteBtn = document.getElementById('delete-btn');
    const tableContainer = document.querySelector('.table-container');
    const scheduleBody = document.getElementById('schedule-body');
    
    // Element สำหรับ Countdown ทั้งสองบล็อก
    const currentClassContainer = document.getElementById('current-class-container');
    const currentClassTitle = document.getElementById('current-class-title');
    const currentClassTimer = document.getElementById('current-class-timer');
    const nextClassContainer = document.getElementById('next-class-container');
    const nextClassTitle = document.getElementById('next-class-title');
    const nextClassTimer = document.getElementById('next-class-timer');
    
    let blockIdCounter = 0;
    let ghostBlock = null; // ตัวแปรสำหรับเก็บ "บล็อกเงา" ขณะลาก

    // --- 2. ฟังก์ชันจัดการ Modal (หน้าต่างป๊อปอัป) ---
    const openModal = () => modal.classList.add('show');
    const closeModal = () => {
        modal.classList.remove('show');
        form.reset();
        document.getElementById('editing-block-id').value = '';
        deleteBtn.classList.remove('visible');
    };
    
    addClassBtn.addEventListener('click', () => {
        form.reset();
        deleteBtn.classList.remove('visible');
        openModal();
    });
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => (e.target === modal) && closeModal());

    // --- 3. ฟังก์ชันหลักในการสร้าง, แก้ไข, และลบรายวิชา ---
    function saveClass(event) {
        event.preventDefault();

        // 3.1 ตรวจสอบความถูกต้องของเวลา (Validation)
        const startTimeStr = document.getElementById('start-time').value;
        const endTimeStr = document.getElementById('end-time').value;
        const startTime = new Date(`1970-01-01T${startTimeStr}`);
        const endTime = new Date(`1970-01-01T${endTimeStr}`);

        if (endTime <= startTime) {
            alert('เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้นเสมอ!');
            return; // หยุดการทำงาน
        }

        // 3.2 รวบรวมข้อมูลจากฟอร์ม
        const editingBlockId = document.getElementById('editing-block-id').value;
        const classData = {
            id: editingBlockId || `class-block-${++blockIdCounter}`,
            name: document.getElementById('subject-name').value,
            day: document.getElementById('day').value,
            startTime: startTimeStr,
            endTime: endTimeStr,
            location: document.getElementById('location').value,
            colorClass: document.getElementById('subject-color').value,
        };

        // 3.3 ถ้าเป็นการแก้ไข ให้ลบบล็อกเก่าทิ้งก่อน
        if (editingBlockId) {
            document.getElementById(editingBlockId)?.remove();
        }
        
        // 3.4 สร้างบล็อกใหม่, ปิด Modal, และอัปเดต Countdown
        createClassBlock(classData);
        closeModal();
        updateCountdown();
    }
    
    function createClassBlock(data) {
        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        if (durationMinutes <= 0) return;

        const targetRow = scheduleBody.querySelector(`tr[data-time="${startHour}"]`);
        if (!targetRow) return;
        const targetCell = targetRow.cells[parseInt(data.day)];
        if (!targetCell) return;

        const block = document.createElement('div');
        block.id = data.id;
        block.className = `class-block ${data.colorClass}`;
        block.innerHTML = `<strong>${data.name}</strong><span>${data.startTime} - ${data.endTime}</span><span>${data.location}</span>`;
        
        // เก็บข้อมูลทั้งหมดไว้ใน dataset เพื่อให้เรียกใช้ได้ง่าย
        Object.assign(block.dataset, data);
        
        const cellHeight = 60; // กำหนดค่าความสูงของแถวเป็นค่าคงที่เพื่อความแม่นยำ
        const topPosition = (startMinute / 60) * cellHeight;
        const blockHeight = (durationMinutes / 60) * cellHeight;
        
        block.style.top = `${topPosition}px`;
        block.style.height = `${blockHeight - 4}px`; // -4px เพื่อความสวยงาม
        
        targetCell.appendChild(block);
    }
    
    form.addEventListener('submit', saveClass);

    deleteBtn.addEventListener('click', () => {
        const editingBlockId = document.getElementById('editing-block-id').value;
        if (editingBlockId && confirm('คุณต้องการลบรายวิชานี้ใช่หรือไม่?')) {
            document.getElementById(editingBlockId)?.remove();
            closeModal();
            updateCountdown();
        }
    });

    // Event Listener สำหรับการคลิกเพื่อแก้ไข
    tableContainer.addEventListener('click', (e) => {
        const block = e.target.closest('.class-block');
        if (block) {
            const data = block.dataset;
            document.getElementById('editing-block-id').value = data.id;
            document.getElementById('subject-name').value = data.name;
            document.getElementById('day').value = data.day;
            document.getElementById('start-time').value = data.startTime;
            document.getElementById('end-time').value = data.endTime;
            document.getElementById('location').value = data.location;
            document.getElementById('subject-color').value = data.colorClass;
            deleteBtn.classList.add('visible');
            openModal();
        }
    });

    // --- 4. ระบบ Countdown Timer แบบแยกส่วน ---
    function updateCountdown() {
        const now = new Date();
        const todayDay = now.getDay() === 0 ? 7 : now.getDay(); // จันทร์=1, อาทิตย์=7

        const allClassesToday = Array.from(document.querySelectorAll('.class-block'))
            .map(block => {
                const [startH, startM] = block.dataset.startTime.split(':');
                const [endH, endM] = block.dataset.endTime.split(':');
                return {
                    name: block.dataset.name,
                    day: parseInt(block.dataset.day),
                    startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH, startM),
                    endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH, endM)
                };
            })
            .filter(cls => cls.day === todayDay)
            .sort((a, b) => a.startTime - b.startTime);

        let currentClass = null;
        let nextClass = null;

        for (const cls of allClassesToday) {
            if (now >= cls.startTime && now < cls.endTime) {
                currentClass = cls;
            }
            if (now < cls.startTime && !nextClass) {
                nextClass = cls;
            }
        }

        // อัปเดตบล็อก "กำลังเรียน"
        if (currentClass) {
            currentClassContainer.classList.remove('hidden');
            const diff = currentClass.endTime - now;
            const { hours, minutes, seconds } = formatTime(diff);
            currentClassTitle.textContent = `"${currentClass.name}" สิ้นสุดใน`;
            currentClassTimer.textContent = `${hours}:${minutes}:${seconds}`;
        } else {
            currentClassContainer.classList.add('hidden');
        }

        // อัปเดตบล็อก "วิชาถัดไป"
        if (nextClass) {
            nextClassContainer.classList.remove('hidden');
            const diff = nextClass.startTime - now;
            const { hours, minutes, seconds } = formatTime(diff);
            nextClassTitle.textContent = `"${nextClass.name}" เริ่มใน`;
            nextClassTimer.textContent = `${hours}:${minutes}:${seconds}`;
        } else {
            nextClassContainer.classList.add('hidden');
        }
    }

    function formatTime(ms) {
        if (ms < 0) ms = 0;
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return { hours, minutes, seconds };
    }
    
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // --- 5. ระบบ Drag & Drop ด้วย Interact.js ---
    interact('.class-block')
        .draggable({
            listeners: {
                start(event) {
                    const block = event.target;
                    block.classList.add('dragging');
                    ghostBlock = document.createElement('div');
                    ghostBlock.className = 'ghost-block';
                    ghostBlock.style.height = `${block.offsetHeight}px`;
                    ghostBlock.style.width = `${block.offsetWidth}px`;
                    tableContainer.appendChild(ghostBlock);
                },
                move(event) {
                    const currentCell = document.elementsFromPoint(event.clientX, event.clientY).find(el => el.tagName === 'TD' && el.parentElement.hasAttribute('data-time'));
                    if (currentCell && ghostBlock) {
                        const parentRow = currentCell.parentElement;
                        const cellHeight = 60;
                        const containerRect = tableContainer.getBoundingClientRect();
                        const yInCell = event.clientY - parentRow.getBoundingClientRect().top;
                        const minutes = Math.round((yInCell / cellHeight) * 60 / 30) * 30;
                        const snappedHour = parseInt(parentRow.dataset.time) + Math.floor(minutes / 60);
                        const snappedMinute = minutes % 60;
                        const snappedTop = (parentRow.getBoundingClientRect().top - containerRect.top) + ((snappedMinute / 60) * cellHeight);
                        const snappedLeft = currentCell.getBoundingClientRect().left - containerRect.left;
                        ghostBlock.style.transform = `translate(${snappedLeft}px, ${snappedTop}px)`;
                        ghostBlock.dataset.newDay = currentCell.cellIndex;
                        ghostBlock.dataset.newStartHour = snappedHour;
                        ghostBlock.dataset.newStartMinute = snappedMinute;
                        ghostBlock.dataset.isValidTarget = "true";
                    } else if (ghostBlock) {
                        ghostBlock.style.transform = 'scale(0)';
                        ghostBlock.dataset.isValidTarget = "false";
                    }
                },
                end(event) {
                    const block = event.target;
                    block.classList.remove('dragging');
                    if (ghostBlock && ghostBlock.dataset.isValidTarget === "true") {
                        const newDay = ghostBlock.dataset.newDay;
                        const newStartHour = parseInt(ghostBlock.dataset.newStartHour);
                        const newStartMinute = parseInt(ghostBlock.dataset.newStartMinute);
                        const durationMinutes = (parseInt(block.dataset.endTime.split(':')[0]) * 60 + parseInt(block.dataset.endTime.split(':')[1])) - (parseInt(block.dataset.startTime.split(':')[0]) * 60 + parseInt(block.dataset.startTime.split(':')[1]));
                        const endTotalMinutes = newStartHour * 60 + newStartMinute + durationMinutes;
                        const newEndHour = Math.floor(endTotalMinutes / 60);
                        const newEndMinute = endTotalMinutes % 60;
                        const newClassData = {
                            ...block.dataset,
                            day: newDay,
                            startTime: `${String(newStartHour).padStart(2, '0')}:${String(newStartMinute).padStart(2, '0')}`,
                            endTime: `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`,
                        };
                        block.remove();
                        createClassBlock(newClassData);
                        updateCountdown();
                    }
                    if (ghostBlock) {
                        ghostBlock.remove();
                        ghostBlock = null;
                    }
                }
            },
            inertia: false
        });
});