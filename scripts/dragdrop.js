export function initializeDragAndDrop() {
    let ghostBlock = null;
    const tableContainer = document.querySelector('.table-container');
    window.interact('.class-block').draggable({
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
            async end(event) {
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
                    window.createClassBlock(newClassData);
                    await window.saveScheduleToFirestore();
                    window.updateCountdown();
                }
                if (ghostBlock) {
                    ghostBlock.remove();
                    ghostBlock = null;
                }
            }
        },
        inertia: false
    });
} 