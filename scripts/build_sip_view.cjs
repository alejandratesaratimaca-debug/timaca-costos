const fs = require('fs');
const path = require('path');

let code = fs.readFileSync('App_Daniela.tsx', 'utf-8');

// Replace export default function App()
code = code.replace(/export default function App\(\) \{/, 'export function MasterUnificadoSipView({ currentUser }: { currentUser?: any }) {');

// In fetchStatus:
code = code.replace(
  /const fetchStatus = async \(\) => {[\s\S]*?if \(res\.ok\) setStatus\(await res\.json\(\)\);[\s\S]*?};/,
  `const fetchStatus = async () => {
    try {
      const res = await fetch('http://192.168.13.193:3005/api/status', { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setStatus(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch('/data/sip/status.json');
      if (res.ok) setStatus(await res.json());
    } catch (e) {}
  };`
);

// In fetchCatalogFiltros:
code = code.replace(
  /const fetchCatalogFiltros = async \(targetAno\?: string\) => {[\s\S]*?const res = await fetch\(`\/api\/filtros\?ano=\${encodeURIComponent\(a\)}`\);[\s\S]*?if \(res\.ok\) {[\s\S]*?setCatalogFiltros\(data\);[\s\S]*?}[\s\S]*?};/,
  `const fetchCatalogFiltros = async (targetAno?: string) => {
    try {
      const a = targetAno || selectedAno || '2026';
      const res = await fetch('http://192.168.13.193:3005/api/filtros?ano=' + encodeURIComponent(a), { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setCatalogFiltros(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch('/data/sip/filtros_2026.json');
      if (res.ok) setCatalogFiltros(await res.json());
    } catch (e) {}
  };`
);

// In fetchProyectos:
code = code.replace(
  /const fetchProyectos = async \(\) => {[\s\S]*?const res = await fetch\('\/api\/proyectos'\);[\s\S]*?if \(res\.ok\) setProyectos\(await res\.json\(\)\);[\s\S]*?};/,
  `const fetchProyectos = async () => {
    try {
      const res = await fetch('http://192.168.13.193:3005/api/proyectos', { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setProyectos(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch('/data/sip/proyectos.json');
      if (res.ok) setProyectos(await res.json());
    } catch (e) {}
  };`
);

// In fetchMatriz:
code = code.replace(
  /const fetchMatriz = async \(\) => {[\s\S]*?const res = await fetch\('\/api\/matriz'\);[\s\S]*?if \(res\.ok\) setMatrizData\(await res\.json\(\)\);[\s\S]*?};/,
  `const fetchMatriz = async () => {
    try {
      const res = await fetch('http://192.168.13.193:3005/api/matriz', { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setMatrizData(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch('/data/sip/matriz.json');
      if (res.ok) setMatrizData(await res.json());
    } catch (e) {}
  };`
);

// In fetchReclasificaciones:
code = code.replace(
  /const fetchReclasificaciones = async \(\) => {[\s\S]*?const res = await fetch\('\/api\/reclasificaciones'\);[\s\S]*?if \(res\.ok\) setReclasificaciones\(await res\.json\(\)\);[\s\S]*?};/,
  `const fetchReclasificaciones = async () => {
    try {
      const res = await fetch('http://192.168.13.193:3005/api/reclasificaciones', { signal: AbortSignal.timeout(2000) });
      if (res.ok) { setReclasificaciones(await res.json()); return; }
    } catch (e) {}
    try {
      const res = await fetch('/data/sip/reclasificaciones.json');
      if (res.ok) setReclasificaciones(await res.json());
    } catch (e) {}
  };`
);

// In fetchConsumos:
code = code.replace(
  /const res = await fetch\(`\/api\/consumos\?\${params\.toString\(\)}`\);[\s\S]*?if \(res\.ok\) {[\s\S]*?setConsumos\(data\.items \|\| \[\]\);[\s\S]*?}/,
  `let res = null;
      try {
        res = await fetch('http://192.168.13.193:3005/api/consumos?' + params.toString(), { signal: AbortSignal.timeout(2500) });
      } catch (e) {}
      if (res && res.ok) {
        const data = await res.json();
        setConsumos(data.items || []);
        setTotalConsumosCount(data.totalCount || 0);
        setTotalConsumosUSD(data.totalMontoUSD || 0);
      } else {
        const resStatic = await fetch('/data/sip/consumos.json');
        if (resStatic.ok) {
          const all = await resStatic.json();
          const items = Array.isArray(all) ? all : (all.items || []);
          setConsumos(items.slice(0, 500));
          setTotalConsumosCount(items.length);
          const sum = items.reduce((acc: number, x: any) => acc + (x.totalUSD || 0), 0);
          setTotalConsumosUSD(sum);
        }
      }`
);

// In fetchCompras:
code = code.replace(
  /const res = await fetch\(`\/api\/compras\?\${params\.toString\(\)}`\);[\s\S]*?if \(res\.ok\) {[\s\S]*?setCompras\(data\.items \|\| \[\]\);[\s\S]*?}/,
  `let res = null;
      try {
        res = await fetch('http://192.168.13.193:3005/api/compras?' + params.toString(), { signal: AbortSignal.timeout(2500) });
      } catch (e) {}
      if (res && res.ok) {
        const data = await res.json();
        setCompras(data.items || []);
        setTotalComprasCount(data.totalCount || 0);
        setTotalComprasUSD(data.totalMontoUSD || 0);
      } else {
        const resStatic = await fetch('/data/sip/compras.json');
        if (resStatic.ok) {
          const all = await resStatic.json();
          const items = Array.isArray(all) ? all : (all.items || []);
          setCompras(items.slice(0, 500));
          setTotalComprasCount(items.length);
          const sum = items.reduce((acc: number, x: any) => acc + (x.totalUSD || 0), 0);
          setTotalComprasUSD(sum);
        }
      }`
);

// In fetchMasterData:
code = code.replace(
  /const res = await fetch\(`\/api\/unificada\?\${params\.toString\(\)}`\);[\s\S]*?if \(res\.ok\) {[\s\S]*?setMasterRows\(data\.items \|\| \[\]\);[\s\S]*?}/,
  `let res = null;
      try {
        res = await fetch('http://192.168.13.193:3005/api/unificada?' + params.toString(), { signal: AbortSignal.timeout(3000) });
      } catch (e) {}
      if (res && res.ok) {
        const data = await res.json();
        setMasterRows(data.items || []);
        if (data.totales) setMasterTotales(data.totales);
        if (data.top_cuentas) setTopCuentas(data.top_cuentas);
      } else {
        const resStatic = await fetch('/data/sip/unificada_septiembre.json');
        if (resStatic.ok) {
          const data = await resStatic.json();
          let items = data.items || [];
          if (selectedCta && selectedCta !== 'TODAS') {
            items = items.filter((r: any) => r.cuenta_aux === selectedCta);
          }
          if (searchMaster) {
            const q = searchMaster.toLowerCase();
            items = items.filter((r: any) => 
              (r.descripcion && r.descripcion.toLowerCase().includes(q)) ||
              (r.cuenta_aux && r.cuenta_aux.toLowerCase().includes(q)) ||
              (r.codigo && r.codigo.toLowerCase().includes(q)) ||
              (r.numero && r.numero.toLowerCase().includes(q)) ||
              (r.solicitante && r.solicitante.toLowerCase().includes(q))
            );
          }
          const start = (pageMaster - 1) * limitMaster;
          setMasterRows(items.slice(start, start + limitMaster));
          if (data.totales) {
            setMasterTotales({
              ...data.totales,
              total_count: items.length
            });
          }
          if (data.top_cuentas) setTopCuentas(data.top_cuentas);
        }
      }`
);

// In handleSyncSIP:
code = code.replace(
  /const res = await fetch\('\/api\/sip\/sync', {/,
  "const res = await fetch('http://192.168.13.193:3005/api/sip/sync', {"
);

// In handleAplicarCorreccion:
code = code.replace(
  /const res = await fetch\('\/api\/reclasificar', {/,
  "const res = await fetch('http://192.168.13.193:3005/api/reclasificar', {"
);

// In handleRevertirCorreccion:
code = code.replace(
  /const res = await fetch\('\/api\/reclasificar\/revertir', {/,
  "const res = await fetch('http://192.168.13.193:3005/api/reclasificar/revertir', {"
);

// In candidateMovimientos:
code = code.replace(
  /const res = await fetch\(`\/api\/correcciones\/buscar\?q=\${encodeURIComponent\(q\)}&estado=\${filtroEstadoCorreccion}`\);/,
  "const res = await fetch('http://192.168.13.193:3005/api/correcciones/buscar?q=' + encodeURIComponent(q) + '&estado=' + filtroEstadoCorreccion);"
);

// In handleExportExcel:
code = code.replace(
  /const res = await fetch\(`\/api\/unificada\/export\?\${params\.toString\(\)}`\);/,
  `let res = null;
      try {
        res = await fetch('http://192.168.13.193:3005/api/unificada/export?' + params.toString());
      } catch (e) {}
      let data = null;
      if (res && res.ok) {
        data = await res.json();
      } else {
        const resStatic = await fetch('/data/sip/unificada_septiembre.json');
        data = await resStatic.json();
      }`
);

fs.writeFileSync('src/components/MasterUnificadoSipView.tsx', code, 'utf-8');
console.log('Successfully generated src/components/MasterUnificadoSipView.tsx');
