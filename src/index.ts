import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connection from './Config/database.config.js';
import authRoute from './Routes/auth.route.js';
import expansesRoute from './Routes/expanses.route.js';
import mobile from './Routes/mobile.route.js'

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = { origin: '*' };

app.use(morgan('dev'));
app.use(express.json());
app.use(cors(corsOptions));
app.use('/api/auth', authRoute);
app.use('/api/expanses', expansesRoute);
app.use('/api/mobile', mobile);

app.get('/', (req: Request, res: Response) => {
	res.json({ message: 'Welcome to the API!' });
});

// Start database connection asynchronously (non-blocking)
connection().catch(err => {
	console.error('Failed to connect to database:', err);
	// Don't exit immediately, allow health checks to respond
});

// Listen on 0.0.0.0 for Cloud Run (not 127.0.0.1)
const HOST = process.env.HOST || '0.0.0.0';
app.listen(+PORT, HOST, () => {
	console.log(`Server is running on ${HOST}:${PORT}`);
});

export default app;
