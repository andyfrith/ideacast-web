import { relations, sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Post lifecycle for dashboard filters and publishing flows.
 */
export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "pending",
  "published",
]);

/**
 * Supported social platforms (extend as new OAuth integrations ship).
 */
export const socialPlatformEnum = pgEnum("social_platform", [
  "linkedin",
  "twitter",
  "instagram",
  "youtube",
]);

/**
 * Connection health for a linked social account.
 */
export const socialIntegrationStatusEnum = pgEnum("social_integration_status", [
  "active",
  "disconnected",
  "error",
]);

/**
 * Application user profile keyed by Clerk `user_id` (e.g. `user_...`).
 * Clerk remains the source of truth for auth; this row mirrors display fields.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * A content item: raw capture, optional media, per-platform formatted text, status.
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rawContent: text("raw_content").notNull().default(""),
    /** Per-platform strings, e.g. `{ "linkedin": "...", "twitter": "..." }`. */
    formattedContent: jsonb("formatted_content")
      .$type<Record<string, string>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    imageUrl: text("image_url"),
    status: postStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("posts_user_id_idx").on(table.userId),
    index("posts_status_idx").on(table.status),
    index("posts_created_at_idx").on(table.createdAt),
  ],
);

/**
 * LLM prompt template. `ownerUserId` null = global/built-in template.
 */
export const templates = pgTable(
  "templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    prompt: text("prompt").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ownerUserId: text("owner_user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("templates_owner_user_id_idx").on(table.ownerUserId)],
);

/**
 * OAuth-linked social account for publishing (tokens — encrypt at rest in production).
 */
export const socialIntegrations = pgTable(
  "social_integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: socialPlatformEnum("platform").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: socialIntegrationStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("social_integrations_user_platform_uid").on(
      table.userId,
      table.platform,
    ),
    index("social_integrations_user_id_idx").on(table.userId),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  templates: many(templates),
  socialIntegrations: many(socialIntegrations),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  owner: one(users, {
    fields: [templates.ownerUserId],
    references: [users.id],
  }),
}));

export const socialIntegrationsRelations = relations(
  socialIntegrations,
  ({ one }) => ({
    user: one(users, {
      fields: [socialIntegrations.userId],
      references: [users.id],
    }),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type PostRow = typeof posts.$inferSelect;
export type PostInsert = typeof posts.$inferInsert;
export type TemplateRow = typeof templates.$inferSelect;
export type TemplateInsert = typeof templates.$inferInsert;
export type SocialIntegrationRow = typeof socialIntegrations.$inferSelect;
export type SocialIntegrationInsert = typeof socialIntegrations.$inferInsert;
