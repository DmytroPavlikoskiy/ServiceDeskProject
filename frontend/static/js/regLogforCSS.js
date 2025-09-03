document.addEventListener("DOMContentLoaded", function () {

  function toggleView() {
    document.querySelector('.login').classList.toggle('is-active');
    document.querySelector('.register').classList.toggle('is-active');
    document.querySelector('.sign-up-toggle').classList.toggle('is-active');
    document.querySelector('.login-toggle').classList.toggle('is-active');
  }

  function slideElements(prop) {
    const showEle = document.querySelector(prop.showEle);
    const hideEle = document.querySelector(prop.hideEle);

    if (showEle) {
      showEle.classList.remove(prop.removeShowClass);
      showEle.classList.add(prop.addShowClass);
    }

    if (hideEle) {
      hideEle.classList.remove(prop.removeHideClass);
      hideEle.classList.add(prop.addHideClass);
    }
  }

  const signUpLink = document.querySelector('.sign-up-toggle a');
  if (signUpLink) {
    signUpLink.addEventListener('click', function (e) {
      e.preventDefault();
      toggleView();
      const viewToggle = document.querySelector('.login-view-toggle');
      if (viewToggle) {
        viewToggle.classList.add('move-top');
        viewToggle.classList.remove('move-bottom');
      }
      slideElements({
        showEle: '.register',
        removeShowClass: 'down',
        addShowClass: 'pull-up',
        hideEle: '.login',
        addHideClass: 'up',
        removeHideClass: 'push-down'
      });
    });
  }

  const loginLink = document.querySelector('.login-toggle a');
  if (loginLink) {
    loginLink.addEventListener('click', function (e) {
      e.preventDefault();
      toggleView();
      const viewToggle = document.querySelector('.login-view-toggle');
      if (viewToggle) {
        viewToggle.classList.add('move-bottom');
        viewToggle.classList.remove('move-top');
      }
      slideElements({
        showEle: '.login',
        removeShowClass: 'up',
        addShowClass: 'push-down',
        hideEle: '.register',
        addHideClass: 'down',
        removeHideClass: 'pull-up'
      });
    });
  }

});