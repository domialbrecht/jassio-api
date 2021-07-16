-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "roomkey" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wis" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game.roomkey_unique" ON "Game"("roomkey");
