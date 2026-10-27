const https = require('https');

https.get('https://workspace-explorer-eta.vercel.app', res => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    const match = html.match(/\/assets\/index-[a-zA-Z0-9_-]+\.js/);
    if (!match) {
      console.log('Main bundle not found in HTML');
      return;
    }
    const jsUrl = 'https://workspace-explorer-eta.vercel.app' + match[0];
    console.log('Checking live JS bundle:', jsUrl);
    
    https.get(jsUrl, jsRes => {
      let js = '';
      jsRes.on('data', chunk => js += chunk);
      jsRes.on('end', () => {
        console.log('JS Bundle length:', js.length);
        console.log('Contains 393375 (CIF Sep):', js.includes('393375'));
        console.log('Contains 339978 (CIF Ago):', js.includes('339978'));
        console.log('Contains 221353 (MOD Sep):', js.includes('221353'));
        console.log('Contains 236688 (Pellas CIF Sep):', js.includes('236688'));
        console.log('Contains 133185 (Pellas MOD Sep):', js.includes('133185'));
        console.log('Contains 1637913 (Total Sep):', js.includes('1637913'));
        console.log('Contains 69055.86 or 69056 (Pellas Servicios Sep):', js.includes('69055.86') || js.includes('69056'));
      });
    });
  });
});
