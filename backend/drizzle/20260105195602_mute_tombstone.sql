CREATE TYPE "public"."group_member_role" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TABLE "habit_group_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"habit_id" uuid,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_group_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "group_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "habit_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" text NOT NULL,
	"max_members" integer DEFAULT 10 NOT NULL,
	"invite_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "habit_groups_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"theme_name" text NOT NULL,
	"primary_color" text NOT NULL,
	"secondary_color" text NOT NULL,
	"background_color" text NOT NULL,
	"card_color" text NOT NULL,
	"text_color" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_preset" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "habit_group_challenges" ADD CONSTRAINT "habit_group_challenges_group_id_habit_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."habit_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_group_challenges" ADD CONSTRAINT "habit_group_challenges_habit_id_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."habits"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_group_members" ADD CONSTRAINT "habit_group_members_group_id_habit_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."habit_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_group_members" ADD CONSTRAINT "habit_group_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_groups" ADD CONSTRAINT "habit_groups_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "habit_group_challenges_group_id_idx" ON "habit_group_challenges" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "habit_group_challenges_habit_id_idx" ON "habit_group_challenges" USING btree ("habit_id");--> statement-breakpoint
CREATE INDEX "habit_group_members_group_id_idx" ON "habit_group_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "habit_group_members_user_id_idx" ON "habit_group_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "habit_group_members_unique" ON "habit_group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "habit_groups_created_by_idx" ON "habit_groups" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "habit_groups_invite_code_idx" ON "habit_groups" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "themes_user_id_idx" ON "themes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "themes_is_preset_idx" ON "themes" USING btree ("is_preset");