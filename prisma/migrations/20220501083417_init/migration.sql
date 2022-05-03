-- CreateTable
CREATE TABLE "Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roomkey" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Wis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Game.roomkey_unique" ON "Game"("roomkey");

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
