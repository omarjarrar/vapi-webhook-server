CREATE TABLE "calls" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_id" varchar(100) NOT NULL,
	"caller_id" varchar(100),
	"start_time" timestamp,
	"end_time" timestamp,
	"duration_seconds" integer,
	"workflow_id" varchar(100),
	"transcription" text,
	"summary" text,
	"status" varchar(20) DEFAULT 'started',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" integer DEFAULT 1,
	CONSTRAINT "calls_call_id_unique" UNIQUE("call_id")
);
--> statement-breakpoint
CREATE TABLE "lead_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"industry" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "calls" ADD CONSTRAINT "calls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;