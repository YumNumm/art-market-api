import { endTime, startTime } from 'hono/timing';
import { isValidUUIDv4 } from '../../utils/is-valid-uuid';
import app from '../../worker';

// get file lists in bucket filtered by id
app.get('/list/:id', async (c) => {
	try {
		const id = c.req.param('id');
		if (id === undefined) {
			return c.json({ error: 'id is required' }, 400);
		}
		const isValidId = (id: string) => {
			if (id == 'tekken_art_market_masterkey') {
				return true;
			}
			return isValidUUIDv4(id);
		};
		if (!isValidId(id)) {
			return c.json({ error: 'id is invalid' }, 400);
		}
		startTime(c, 'list');
		const bucket = c.env.BUCKET;
		const result = await bucket.list({
			prefix: id,
			limit: 100,
		});
		endTime(c, 'list');
		return c.json({ result });
	} catch (error) {
		return c.json({ error: error }, 500);
	}
});
