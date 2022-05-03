/*
  Warnings:

  - Added the required column `ScoreA` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ScoreB` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TeamA` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TeamB` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomkey" TEXT NOT NULL,
    "ScoreA" INTEGER NOT NULL,
    "ScoreB" INTEGER NOT NULL,
    "TeamA" TEXT NOT NULL,
    "TeamB" TEXT NOT NULL
);
INSERT INTO "new_Game" ("id", "roomkey") SELECT "id", "roomkey" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game.roomkey_unique" ON "Game"("roomkey");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
