import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users_table", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull().unique(),
});

export const postsTable = pgTable("posts_table", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const userProfilesTable = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gender: text("gender"),
  birthDate: text("birth_date"),
  calendarType: text("calendar_type"),
  birthTime: text("birth_time"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const talismansTable = pgTable("talismans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfilesTable.id, { onDelete: "cascade" }),
  storagePath: text("storage_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size"),
  fileType: text("file_type"),
  concern: text("concern"),
  concernType: text("concern_type"),
  translatedPhrase: text("translated_phrase"),
  generatedBy: text("generated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultationsTable = pgTable("consultations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfilesTable.id, { onDelete: "cascade" }),
  talismanId: uuid("talisman_id").references(() => talismansTable.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  messages: json("messages").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// 관계 정의
export const userProfilesRelations = relations(
  userProfilesTable,
  ({ many }) => ({
    talismans: many(talismansTable),
    consultations: many(consultationsTable),
  })
);

export const talismansRelations = relations(
  talismansTable,
  ({ one, many }) => ({
    userProfile: one(userProfilesTable, {
      fields: [talismansTable.userId],
      references: [userProfilesTable.id],
    }),
    consultations: many(consultationsTable),
  })
);

export const consultationsRelations = relations(
  consultationsTable,
  ({ one }) => ({
    userProfile: one(userProfilesTable, {
      fields: [consultationsTable.userId],
      references: [userProfilesTable.id],
    }),
    talisman: one(talismansTable, {
      fields: [consultationsTable.talismanId],
      references: [talismansTable.id],
    }),
  })
);

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;

export type InsertUserProfile = typeof userProfilesTable.$inferInsert;
export type SelectUserProfile = typeof userProfilesTable.$inferSelect;

export type InsertTalisman = typeof talismansTable.$inferInsert;
export type SelectTalisman = typeof talismansTable.$inferSelect;

export type InsertConsultation = typeof consultationsTable.$inferInsert;
export type SelectConsultation = typeof consultationsTable.$inferSelect;
