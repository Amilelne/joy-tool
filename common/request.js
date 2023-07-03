const myHeaders = new Headers();
myHeaders.append('Content-Type', 'application/json');

export async function post(url, options) {
  const resp = await fetch(url, {
    method: 'POST',
    headers: myHeaders,
    ...options,
  });
  if (resp.ok) {
    return resp.json();
  } else {
    return Promise.resolve({
      status: 'error',
    });
  }
}
