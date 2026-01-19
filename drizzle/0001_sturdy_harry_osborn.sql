CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"reference" text,
	"description" text,
	"quantity" integer,
	"date" timestamp,
	"unit_selling_price" numeric(10, 2) NOT NULL,
	"unit_purchase_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
