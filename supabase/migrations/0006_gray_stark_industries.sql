CREATE TABLE "compatibility_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"result_type" text NOT NULL,
	"person1_name" text NOT NULL,
	"person1_birthdate" text NOT NULL,
	"person1_gender" text NOT NULL,
	"person1_birthtime" text,
	"person2_name" text NOT NULL,
	"person2_birthdate" text NOT NULL,
	"person2_gender" text NOT NULL,
	"person2_birthtime" text,
	"result_data" jsonb NOT NULL,
	"total_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "compatibility_results" ADD CONSTRAINT "compatibility_results_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;