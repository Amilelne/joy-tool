const clickOutside = {
  mounted(el, binding) {
    function eventHandler(e) {
      if (el.contains(e.target)) {
        return false;
      }
      if (binding.value && typeof binding.value === 'function') {
        binding.value(e);
      }
    }
    el.__click_outside__ = eventHandler;
    document.addEventListener('click', el.__click_outside__);
  },
  beforeUnmount(el) {
    document.removeEventListener('click', el.__click_outside__);
    delete el.__click_outside__;
  },
};

export default clickOutside;
