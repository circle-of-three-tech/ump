import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';

export const auth = () => getServerSession(authOptions);