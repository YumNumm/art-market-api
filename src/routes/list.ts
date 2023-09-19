import app from "../worker";

app.get('/list', async (c) => {
	const result = await c.env.BUCKET.list();
	return c.json({ result });
});
