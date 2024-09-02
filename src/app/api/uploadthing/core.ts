import { db } from "@/db";
import sharp from "sharp";
import { buffer } from "stream/consumers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { z } from "zod";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      const typedInput = input as { configId?: string };
      return { input: typedInput };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input as { configId?: string };

      const res: Response = await fetch(file.url);
      const buffer: ArrayBuffer = await res.arrayBuffer();

      const imgMetadata: sharp.Metadata = await sharp(buffer).metadata();
      const { width, height } = imgMetadata;

      if (!configId) {
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.url,
            height: height || 500,
            width: width || 500,
          },
        });

        return { configId: configuration.id };
      } else {
        const updatedConfiguration = await db.configuration.update({
          where: {
            id: configId,
          },
          data: {
            croppedImageUrl: file.url,
          },
        });

        return { configId: updatedConfiguration.id };
      }
    }),
} as FileRouter;

export type OurFileRouter = typeof ourFileRouter;
