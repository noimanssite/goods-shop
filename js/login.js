// login.html 동작: 로그인 / 회원가입 탭 토글 + 폼 제출
(function () {
  document.addEventListener('DOMContentLoaded', init);

  let mode = 'signin'; // 'signin' | 'signup'

  async function init() {
    // 이미 로그인 상태면 곧바로 홈으로 이동
    try {
      const user = await window.auth.getUser();
      if (user) {
        location.replace('index.html');
        return;
      }
    } catch (e) {
      // 무시하고 폼을 그대로 보여준다
    }

    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const form = document.getElementById('auth-form');

    tabSignin.addEventListener('click', () => setMode('signin'));
    tabSignup.addEventListener('click', () => setMode('signup'));
    form.addEventListener('submit', onSubmit);
  }

  function setMode(next) {
    mode = next;
    const heading = document.getElementById('auth-heading');
    const submit = document.getElementById('submit-btn');
    const tabSignin = document.getElementById('tab-signin');
    const tabSignup = document.getElementById('tab-signup');
    const pwInput = document.querySelector('#auth-form input[name="password"]');

    const label = next === 'signup' ? '회원가입' : '로그인';
    if (heading) heading.textContent = label;
    submit.textContent = label;
    document.title = `${label} · 굿즈샵`;

    tabSignin.classList.toggle('is-active', next === 'signin');
    tabSignup.classList.toggle('is-active', next === 'signup');
    tabSignin.setAttribute('aria-selected', next === 'signin' ? 'true' : 'false');
    tabSignup.setAttribute('aria-selected', next === 'signup' ? 'true' : 'false');

    if (pwInput) {
      pwInput.setAttribute('autocomplete', next === 'signup' ? 'new-password' : 'current-password');
    }

    hideMessage();
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const submit = document.getElementById('submit-btn');
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (!email || !password) {
      showMessage('이메일과 비밀번호를 입력해 주세요.', 'error');
      return;
    }
    if (password.length < 6) {
      showMessage('비밀번호는 6자 이상이어야 합니다.', 'error');
      return;
    }

    const originalText = submit.textContent;
    submit.disabled = true;
    submit.textContent = '처리 중...';
    hideMessage();

    try {
      const fn = mode === 'signup' ? window.auth.signUp : window.auth.signIn;
      const result = await fn(email, password);
      if (result && result.error) {
        showMessage(result.error, 'error');
        return;
      }
      location.replace('index.html');
    } catch (err) {
      const msg = (err && err.message) ? err.message : '알 수 없는 오류가 발생했습니다.';
      showMessage(msg, 'error');
    } finally {
      submit.disabled = false;
      submit.textContent = originalText;
    }
  }

  function showMessage(text, kind) {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = text;
    el.classList.remove('success');
    if (kind === 'success') el.classList.add('success');
    el.hidden = false;
  }

  function hideMessage() {
    const el = document.getElementById('message');
    if (!el) return;
    el.textContent = '';
    el.hidden = true;
  }
})();
