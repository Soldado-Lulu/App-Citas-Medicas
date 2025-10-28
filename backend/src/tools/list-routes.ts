// tools/list-routes.ts (ejecutar con ts-node)
import app from '../index'; // importa tu app ya con routers montados

type Layer = any;
function getRoutes(a: any) {
  const routes: { method: string; path: string }[] = [];
  a._router.stack.forEach((m: Layer) => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods);
      methods.forEach(method => routes.push({ method: method.toUpperCase(), path: m.route.path }));
    } else if (m.name === 'router' && m.handle.stack) {
      m.handle.stack.forEach((r: Layer) => {
        if (!r.route) return;
        const methods = Object.keys(r.route.methods);
        methods.forEach(method => routes.push({ method: method.toUpperCase(), path: r.route.path }));
      });
    }
  });
  return routes;
}

const routes = getRoutes(app);
console.log(JSON.stringify(routes, null, 2));
