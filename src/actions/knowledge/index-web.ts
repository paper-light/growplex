import z from "zod";

export const IndexWebSchema = z.object({
  url: z.string(),
});

export const indexWebHandler = async (input: { url: string }) => {
  try {
    // await indexWeb(input.url);
    return { ok: true };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
