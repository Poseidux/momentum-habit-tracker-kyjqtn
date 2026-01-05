DROP INDEX "check_ins_date_idx";--> statement-breakpoint
DROP INDEX "check_ins_habit_date_unique";--> statement-breakpoint
DROP INDEX "habits_is_active_idx";--> statement-breakpoint
ALTER TABLE "check_ins" ALTER COLUMN "value" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "check_ins" ADD COLUMN "completed_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "type" "habit_type" DEFAULT 'yes_no' NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "schedule" text;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "frequency" integer;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "custom_tags" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "habit_strength" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
ALTER TABLE "habits" ADD COLUMN "consistency_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "total_check_ins" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_premium" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "check_ins_completed_at_idx" ON "check_ins" USING btree ("completed_at");--> statement-breakpoint
ALTER TABLE "check_ins" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "habit_type";--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "target_value";--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "schedule_type";--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "schedule_config";--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "reminder_time";--> statement-breakpoint
ALTER TABLE "habits" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "user_stats" DROP COLUMN "total_xp";--> statement-breakpoint
ALTER TABLE "user_stats" DROP COLUMN "level";--> statement-breakpoint
ALTER TABLE "user_stats" DROP COLUMN "grace_skips_used_this_week";--> statement-breakpoint
DROP TYPE "public"."schedule_type";