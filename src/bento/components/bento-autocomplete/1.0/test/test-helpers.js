export function areOptionsVisible(wrapper) {
  return !wrapper.find('[role="listbox"]').prop('hidden');
}
