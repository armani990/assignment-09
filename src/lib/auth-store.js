const STORAGE_KEY = "pizzahub:user";

let state = null;
let loaded = false;
const listeners = new Set();

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function subscribe(listener) {
  listeners.add(listener);

  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      loaded = false;
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getUser() {
  if (!loaded) {
    loaded = true;
    state = readStorage();
  }
  return state;
}

export function getServerUser() {
  return null;
}

export function writeUser(user) {
  state = user;
  loaded = true;

  try {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore unwritable storage
  }

  listeners.forEach((listener) => listener());
}
