import { z } from "zod";

export const engineeringSubmissionSchema = z.object({
  asset_name: z.string().nullish(),
  unit_id: z.string().nullish(),
  material_code: z.string().nullish(),
  
  // Coerce string inputs to numbers. Handle null/empty and avoid coercion to 0 for optional fields.
  equip_n: z.coerce.number().min(1, "Equipment Number is required"),
  so_no: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().optional()),
  network_no: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().optional()),
  
  status_update: z.object({
    tech_sub_status: z.string().nullish(),
    sample_status: z.string().nullish(),
    layout_status: z.string().nullish(),
    car_m_dwg_status: z.string().nullish(),
    cop_dwg_status: z.string().nullish(),
    landing_dwg_status: z.string().nullish(),
  }).catchall(z.any()).optional(),
  
  dg1_milestone: z.object({
    ms2: z.string().date().nullish().or(z.literal("")),
    ms2a: z.string().date().nullish().or(z.literal("")),
    ms2c: z.string().date().nullish().or(z.literal("")),
    ms2z: z.string().date().nullish().or(z.literal("")),
    ms3: z.string().date().nullish().or(z.literal("")),
    ms3a_exw: z.string().date().nullish().or(z.literal("")),
    ms3b: z.string().date().nullish().or(z.literal("")),
    ms3s_ksa_port: z.string().date().nullish().or(z.literal("")),
    ms2_3s: z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().optional()),
  }).optional(),
});

export type EngineeringSubmissionFormValues = z.infer<typeof engineeringSubmissionSchema> & {
    files?: {
        tech_sub_status_pdf?: File | null;
        sample_status_pdf?: File | null;
        layout_status_pdf?: File | null;
        car_m_dwg_status_pdf?: File | null;
        cop_dwg_status_pdf?: File | null;
        landing_dwg_status_pdf?: File | null;
        [key: string]: File | null | undefined;
    }
};
