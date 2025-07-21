export const openModal = (modal) => modal.classList.add('show');
export const closeModal = (modal, form, deleteBtn) => {
    modal.classList.remove('show');
    form.reset();
    document.getElementById('editing-block-id').value = '';
    deleteBtn.classList.remove('visible');
}; 