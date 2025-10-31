// src/lib/dayjs.ts
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import tz from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(tz);

export const TZ = 'America/La_Paz';
export const d = () => dayjs().tz(TZ);
export default dayjs;
