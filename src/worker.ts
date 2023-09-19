import { Hono } from 'hono';
import { Bindings } from './bindings';

import { prettyJSON } from 'hono/pretty-json';
import { cors } from 'hono/cors';

export const app = new Hono<{ Bindings: Bindings }>();

app.notFound(async (c) => c.json({ erorr: 'not found' }, 404));
app.use('*', prettyJSON());
app.use(
	'*',
	cors({
		origin: ['http://localhost:3000', 'https://tekken.work'],
	})
);

app.onError(async (error, c) => {
	console.error(error);
	return c.json({ error: error }, 500);
});

app.use('*', async (c, next) => {
	// ignore /lists/id/* and /file/*/*
	if ((c.req.path.includes('/list/') && !c.req.path.endsWith('/list/')) || c.req.path.includes('/file/')) {
		return next();
	}
	// check header
	const key = c.req.header('X-Api-Key');
	if (key !== c.env.X_API_KEY) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	return next();
});

export default app;
