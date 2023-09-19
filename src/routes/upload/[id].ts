import { endTime, startTime } from "hono/timing";
import app from "../../worker";

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
		startTime(c, 'upload');
		const body = await c.req.parseBody();
		const file = body.file as File;
		const bucket = c.env.BUCKET;
		const fileName = `${id}/${name}`;
		const response = await bucket.put(fileName, await file.arrayBuffer(), {
			httpMetadata: {
				contentType: file.type,
			},
		});
		endTime(c, 'upload');
		return c.json({
			message: `upload ${fileName} success`,
			object: response,
			fileName,
		});
	} catch (error) {
		return c.json({ error: error }, 500);
	}
});
