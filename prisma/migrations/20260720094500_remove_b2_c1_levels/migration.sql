-- Drop all content at levels B2/C1 (site is narrowing to A1/A2/B1 only)
-- before removing those values from the Level enum, since Postgres can't
-- cast rows that still use a value being dropped.
DELETE FROM "TextAttempt" USING "HebrewText"
  WHERE "TextAttempt"."textId" = "HebrewText"."id" AND "HebrewText"."level" IN ('B2', 'C1');
DELETE FROM "VocabItem" USING "HebrewText"
  WHERE "VocabItem"."textId" = "HebrewText"."id" AND "HebrewText"."level" IN ('B2', 'C1');
DELETE FROM "Question" USING "HebrewText"
  WHERE "Question"."textId" = "HebrewText"."id" AND "HebrewText"."level" IN ('B2', 'C1');
DELETE FROM "HebrewText" WHERE "level" IN ('B2', 'C1');
DELETE FROM "GrammarTopic" WHERE "level" IN ('B2', 'C1');

-- AlterEnum
BEGIN;
CREATE TYPE "Level_new" AS ENUM ('A1', 'A2', 'B1');
ALTER TABLE "HebrewText" ALTER COLUMN "level" TYPE "Level_new" USING ("level"::text::"Level_new");
ALTER TABLE "GrammarTopic" ALTER COLUMN "level" TYPE "Level_new" USING ("level"::text::"Level_new");
ALTER TYPE "Level" RENAME TO "Level_old";
ALTER TYPE "Level_new" RENAME TO "Level";
DROP TYPE "public"."Level_old";
COMMIT;
