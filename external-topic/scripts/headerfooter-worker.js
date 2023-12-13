onmessage = async (e) => {
  const APIs = {
    header: 'https://www.walgreens.com/common/v1/headerui',
    footer: 'https://www.walgreens.com/common/v1/footerui',
  };
  const { source } = e.data;
  const resp = await fetch(APIs[source]);

  if (!resp.ok) {
    postMessage({ source, ok: resp.ok });
    return;
  }

  const jsonData = await resp.json();

  postMessage({
    source,
    ok: resp.ok,
    ...jsonData,
  });
};
