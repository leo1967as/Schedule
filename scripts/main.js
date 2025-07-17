document.addEventListener('DOMContentLoaded', () => {
    // --- ส่วนของ DOM Elements ---
    const modal = document.getElementById('add-class-modal');
    const addClassBtn = document.getElementById('add-class-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('add-class-form');
    const deleteBtn = document.getElementById('delete-btn');
    const scheduleTable = document.getElementById('schedule-table');
    const scheduleBody = document.getElementById('schedule-body');
    
    let blockIdCounter = 0;

    // --- ฟังก์ชันจัดการ Modal ---
    const openModal = () => modal.classList.add('show');
    const closeModal = () => {
        modal.classList.remove('show');
        form.reset();
        document.getElementById('editing-block-id').value = '';
        deleteBtn.classList.remove('visible');
    };
    
    addClassBtn.addEventListener('click', () => {
        form.reset();
        deleteBtn.classList.remove('visible'); // ซ่อนปุ่มลบเมื่อสร้างใหม่
        openModal();
    });
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => (e.target === modal) && closeModal());
    
    // --- ฟังก์ชันสร้าง/อัปเดตบล็อกวิชา ---
    function saveClass(event) {
        event.preventDefault();

        const editingBlockId = document.getElementById('editing-block-id').value;
        const classData = {
            id: editingBlockId || `class-block-${++blockIdCounter}`,
            name: document.getElementById('subject-name').value,
            day: document.getElementById('day').value,
            startTime: document.getElementById('start-time').value,
            endTime: document.getElementById('end-time').value,
            location: document.getElementById('location').value,
            colorClass: document.getElementById('subject-color').value,
        };

        if (editingBlockId) {
            const existingBlock = document.getElementById(editingBlockId);
            if (existingBlock) existingBlock.remove();
        }
        
        createClassBlock(classData);
        closeModal();
    }
    
    function createClassBlock(data) {
        // คำนวณตำแหน่งและขนาด
        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        if (durationMinutes <= 0) return;

        // หาเซลล์เป้าหมาย
        const targetRow = scheduleBody.querySelector(`tr[data-time="${startHour}"]`);
        if (!targetRow) return;
        const targetCell = targetRow.cells[parseInt(data.day)];

        // สร้าง Element ของบล็อก
        const block = document.createElement('div');
        block.id = data.id;
        block.className = `class-block ${data.colorClass}`;
        block.innerHTML = `
            <strong>${data.name}</strong>
            <span>${data.startTime} - ${data.endTime}</span>
            <span>${data.location}</span>
        `;
        
        // เก็บข้อมูลไว้ใน dataset เพื่อใช้อ้างอิง
        Object.assign(block.dataset, data);
        
        // กำหนดตำแหน่งและขนาด
        const cellHeight = targetCell.offsetHeight;
        const topPosition = (startMinute / 60) * cellHeight;
        const blockHeight = (durationMinutes / 60) * cellHeight;
        
        block.style.top = `${topPosition}px`;
        block.style.height = `${blockHeight - 4}px`; // -4 เพื่อความสวยงาม
        
        targetCell.appendChild(block);
    }
    
    form.addEventListener('submit', saveClass);

    // --- ฟังก์ชันแก้ไข/ลบ ---
    deleteBtn.addEventListener('click', () => {
        const editingBlockId = document.getElementById('editing-block-id').value;
        if (editingBlockId && confirm('คุณต้องการลบรายวิชานี้ใช่หรือไม่?')) {
            document.getElementById(editingBlockId)?.remove();
            closeModal();
        }
    });

    scheduleTable.addEventListener('click', (e) => {
        const block = e.target.closest('.class-block');
        if (block) {
            // นำข้อมูลจาก dataset มาใส่ในฟอร์ม
            const data = block.dataset;
            document.getElementById('editing-block-id').value = data.id;
            document.getElementById('subject-name').value = data.name;
            document.getElementById('day').value = data.day;
            document.getElementById('start-time').value = data.startTime;
            document.getElementById('end-time').value = data.endTime;
            document.getElementById('location').value = data.location;
            document.getElementById('subject-color').value = data.colorClass;
            
            deleteBtn.classList.add('visible'); // แสดงปุ่มลบ
            openModal();
        }
    });

    // ---  หัวใจหลัก: การตั้งค่า INTERACT.JS ---
    interact('.class-block')
        .draggable({
            listeners: {
                start(event) {
                    const block = event.target;
                    block.classList.add('dragging');
                    // เก็บตำแหน่งเริ่มต้น
                    block.dataset.startX = block.style.left;
                    block.dataset.startY = block.style.top;
                },
                move(event) {
                    const block = event.target;
                    let x = (parseFloat(block.dataset.x) || 0) + event.dx;
                    let y = (parseFloat(block.dataset.y) || 0) + event.dy;
                    block.style.transform = `translate(${x}px, ${y}px)`;
                    block.dataset.x = x;
                    block.dataset.y = y;
                },
                end(event) {
                    const block = event.target;
                    block.classList.remove('dragging');

                    // หาเซลล์ที่ปล่อยเมาส์
                    const endRect = block.getBoundingClientRect();
                    const endX = endRect.left + endRect.width / 2;
                    const endY = endRect.top + endRect.height / 2;
                    const droppedCell = document.elementsFromPoint(endX, endY).find(el => el.tagName === 'TD' && el.parentElement.hasAttribute('data-time'));

                    if (droppedCell) {
                        const newDay = droppedCell.cellIndex;
                        const parentRow = droppedCell.parentElement;
                        const startHour = parseInt(parentRow.dataset.time);
                        const cellHeight = droppedCell.offsetHeight;
                        
                        // คำนวณเวลาใหม่ (ปัดให้ลงตัวทุก 15 นาที)
                        const yInCell = endY - parentRow.getBoundingClientRect().top;
                        const minutes = Math.round((yInCell / cellHeight) * 60 / 15) * 15;
                        const newStartHour = startHour + Math.floor(minutes / 60);
                        const newStartMinute = minutes % 60;
                        
                        // คำนวณเวลาสิ้นสุด (ให้ระยะเวลาเท่าเดิม)
                        const durationMinutes = (parseInt(block.dataset.endTime.split(':')[0]) * 60 + parseInt(block.dataset.endTime.split(':')[1])) - (parseInt(block.dataset.startTime.split(':')[0]) * 60 + parseInt(block.dataset.startTime.split(':')[1]));
                        const endTotalMinutes = newStartHour * 60 + newStartMinute + durationMinutes;
                        const newEndHour = Math.floor(endTotalMinutes / 60);
                        const newEndMinute = endTotalMinutes % 60;
                        
                        // อัปเดตข้อมูลใน dataset
                        block.dataset.day = newDay;
                        block.dataset.startTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMinute).padStart(2, '0')}`;
                        block.dataset.endTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`;
                        
                        // ย้าย Element และจัดตำแหน่งใหม่
                        droppedCell.appendChild(block);
                    }
                    
                    // รีเซ็ต transform และคำนวณตำแหน่ง top/left ใหม่
                    block.style.transform = 'translate(0, 0)';
                    block.dataset.x = 0;
                    block.dataset.y = 0;
                    createClassBlock({ ...block.dataset }); // ใช้ฟังก์ชันเดิมเพื่อวาดใหม่
                    document.getElementById(block.id)?.remove(); // ลบของเก่าที่ตำแหน่งเดิม
                }
            },
            modifiers: [ // ทำให้ลากได้แค่ในขอบเขตของตาราง
                interact.modifiers.restrictRect({
                    restriction: '.table-container',
                    endOnly: true
                })
            ],
            inertia: true // ทำให้มีแรงเฉื่อยตอนปล่อย
        });
});