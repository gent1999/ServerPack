-- CreateTable
CREATE TABLE "radio_tracks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "spotifyTrackId" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "blurb" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radio_tracks_pkey" PRIMARY KEY ("id")
);
