import z from "zod";

const countrySchema = z.object({
  name: z.string(),
  age: z.number().int(),
  population: z.string(),
  region: z.enum([
    "norteamarica",
    "suramerica",
    "europa",
    "africa",
    "asia",
    "oceania",
  ]),
});

export function valideCountry(object) {
  return countrySchema.safeParse(object);
}

export function parcialCountry(object) {
  return countrySchema.partial().safeParse(object);
}
