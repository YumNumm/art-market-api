import { Hono } from 'hono';
import { Bindings } from './bindings';

import { prettyJSON } from 'hono/pretty-json';
const app = new Hono<{ Bindings: Bindings }>();

app.notFound(async (c) => c.json({ erorr: 'not found' }, 404));
app.use('*', prettyJSON());

app.onError(async (error, c) => {
	console.error(error);
	return c.json({ error: error }, 500);
});

app.use('*', async (c, next) => {
	// ignore check match
	// ignore /lists/id/* and /file/*/*
	if (c.req.path.startsWith('/list/id/') || c.req.path.startsWith('/file/')) {
		return next();
	}
	// check header
	const key = c.req.header('X-Api-Key');
	if (key !== c.env.X_API_KEY) {
		return c.json({ error: 'Unauthorized' }, 401);
	}
	return next();
});

app.get('/list', async (c) => {
	const result = await c.env.BUCKET.list();
	return c.json({ result });
});

// upload picture
app.put('/upload/:id', async (c) => {
	try {
		// query parameter
		const id = c.req.param('id');
		const name = c.req.query('name');
		if (id === undefined) {
			return c.json({ error: 'id is required' }, 400);
		}
		if (name === undefined) {
			return c.json({ error: 'name is required' }, 400);
		}

		// upload file
		const body = await c.req.parseBody();
		const file = body.file as File;
		const bucket = c.env.BUCKET;
		const fileName = `${id}/${name}`;
		const response = await bucket.put(fileName, await file.arrayBuffer(), {
			httpMetadata: {
				contentType: file.type,
			},
		});
		return c.json({
			message: `upload ${fileName} success`,
			object: response,
			fileName,
		});
	} catch (error) {
		return c.json({ error: error }, 500);
	}
});

// get file lists in bucket filtered by id
app.get('/list/:id', async (c) => {
	try {
		const id = c.req.param('id');
		if (id === undefined) {
			return c.json({ error: 'id is required' }, 400);
		}
		const bucket = c.env.BUCKET;
		const result = await bucket.list({
			prefix: id,
			limit: 100,
		});
		return c.json({ result });
	} catch (error) {
		return c.json({ error: error }, 500);
	}
});

// get file
app.get('/file/:id/:name', async (c) => {
	try {
		const id = c.req.param('id');
		const name = c.req.param('name');
		if (id === undefined) {
			return c.json({ error: 'id is required' }, 400);
		}
		if (name === undefined) {
			return c.json({ error: 'name is required' }, 400);
		}
		const bucket = c.env.BUCKET;
		const fileName = `${id}/${name}`;
		const object = await bucket.get(fileName);
		if (object === null) {
			return c.json({ error: 'file not found' }, 404);
		}
		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('etag', object.etag);

		return new Response(object.body, {
			headers: headers,
		});
	} catch (error) {
		return c.json({ error: error }, 500);
	}
});

export default app;
