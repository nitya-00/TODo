// Supabase's browser client is loaded only for a configured deployment. Its
// publishable/anon key is intentionally safe to expose; Row Level Security in
// supabase/schema.sql is what protects the data.
window.authReady = (async () => {
  const response = await fetch('/api/config');
  if (!response.ok) return null;
  const config = await response.json();
  if (!config.supabaseUrl || !config.supabaseKey) return null;
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const client = createClient(config.supabaseUrl, config.supabaseKey);
  window.supabaseAuth = client;
  return client;
})();

window.currentAccessToken = async () => {
  const client = await window.authReady;
  if (!client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session?.access_token || null;
};

window.showSignIn = async () => {
  const client = await window.authReady;
  if (!client) {
    alert('Supabase is not configured yet. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY before deploying.');
    return;
  }
  document.querySelector('#signInDialog').showModal();
};

window.finishSignIn = async (event) => {
  event.preventDefault();
  const client = await window.authReady;
  const name = document.querySelector('#signInName').value.trim();
  const email = document.querySelector('#signInEmail').value.trim();
  const password = document.querySelector('#signInPassword').value;
  const status = document.querySelector('#signInStatus');
  const submit = document.querySelector('#signInSubmit');
  if (!name || !email || !password) return;
  if (!/^[^\s@]+@gmail\.com$/i.test(email)) { status.textContent = 'Please use a Gmail address.'; return; }
  submit.disabled = true;
  status.textContent = 'Signing you in…';
  // let result = await client.auth.signInWithPassword({ email, password });
  // if (result.error && /invalid login credentials/i.test(result.error.message)) {
  //   result = await client.auth.signUp({ email, password, options: { data: { name } } });
  // }
  const result = await client.auth.signInWithPassword({
  email,
  password
});
  submit.disabled = false;
  if (result.error) { status.textContent = result.error.message; return; }
  if (!result.data.session) {
    status.textContent = 'Check your Gmail inbox to confirm your account, then sign in again.';
    return;
  }
  document.querySelector('#signInDialog').close();
  window.location.reload();
};

window.signOut = async () => {
  const client = await window.authReady;
  await client?.auth.signOut();
  window.location.reload();
};
