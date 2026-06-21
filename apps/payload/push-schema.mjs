
import { getPayload } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';

// Import collections
import { Users } from './src/collections/Users.ts';
import { Media } from './src/collections/Media.ts';
import { Categories } from './src/collections/Categories.ts';
import { Pages } from './src/collections/Pages.ts';
import { BlogPosts } from './src/collections/BlogPosts.ts';
import { GlossaryTerms } from './src/collections/GlossaryTerms.ts';
import { FaqItems } from './src/collections/FaqItems.ts';
import { Courses } from './src/collections/Courses.ts';
import { Modules } from './src/collections/Modules.ts';
import { Lessons } from './src/collections/Lessons.ts';
import { Leads } from './src/collections/Leads.ts';
import { Orders } from './src/collections/Orders.ts';
import { Services } from './src/collections/Services.ts';
import { Enrollments } from './src/collections/Enrollments.ts';
import { LessonProgress } from './src/collections/LessonProgress.ts';

import { buildConfig } from 'payload';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const config = await buildConfig({
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Pages, BlogPosts, GlossaryTerms, FaqItems, Courses, Modules, Lessons, Leads, Orders, Services, Enrollments, LessonProgress],
  db: postgresAdapter({ migrationDir: './src/migrations', push: true, pool: { connectionString: process.env.DATABASE_URL } }),
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  graphQL: { disable: false },
});

const payload = await getPayload({ config });
console.log('Payload initialized successfully - schema pushed!');
await payload.destroy();
process.exit(0);

