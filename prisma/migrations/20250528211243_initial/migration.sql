-- CreateTable
CREATE TABLE "Annotator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TIMESTAMP(3),

    CONSTRAINT "Annotator_pkey" PRIMARY KEY ("id")
);
