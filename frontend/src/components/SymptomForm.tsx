"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SymptomFormData {
  patient_age: number | "";
  patient_sex: "laki-laki" | "perempuan" | "";
  patient_weight?: number | "";
  is_pregnant?: boolean;
  symptoms: string;
  temperature?: number | "";
  duration_days: number | "";
  additional_notes?: string;
}

interface SymptomFormProps {
  onSubmit: (data: SymptomFormData) => void;
  isLoading?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SYMPTOM_SHORTCUTS = [
  "demam tinggi",
  "batuk",
  "sesak nafas",
  "diare",
  "muntah",
  "sakit kepala",
  "nyeri perut",
  "lemas",
  "bintik merah",
  "kejang",
  "tidak sadar",
  "perdarahan",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SymptomForm({ onSubmit, isLoading = false }: SymptomFormProps) {
  const [form, setForm] = useState<SymptomFormData>({
    patient_age: "",
    patient_sex: "",
    patient_weight: "",
    is_pregnant: false,
    symptoms: "",
    temperature: "",
    duration_days: "",
    additional_notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SymptomFormData, string>>>({});

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error on change
    if (errors[name as keyof SymptomFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function addShortcut(symptom: string) {
    setForm((prev) => {
      const current = prev.symptoms.trim();
      const already = current
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .includes(symptom.toLowerCase());
      if (already) return prev;
      return {
        ...prev,
        symptoms: current ? `${current}, ${symptom}` : symptom,
      };
    });
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof SymptomFormData, string>> = {};

    if (form.patient_age === "" || Number(form.patient_age) < 0 || Number(form.patient_age) > 120) {
      newErrors.patient_age = "Usia pasien wajib diisi (0–120 tahun)";
    }
    if (!form.patient_sex) {
      newErrors.patient_sex = "Jenis kelamin wajib dipilih";
    }
    if (!form.symptoms.trim() || form.symptoms.trim().length < 5) {
      newErrors.symptoms = "Keluhan/gejala wajib diisi (minimal 5 karakter)";
    }
    if (form.duration_days === "" || Number(form.duration_days) < 0) {
      newErrors.duration_days = "Durasi gejala wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  }

  const showPregnant =
    form.patient_sex === "perempuan" &&
    Number(form.patient_age) >= 12 &&
    Number(form.patient_age) <= 55;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a1f14] flex flex-col">
      {/* Header */}
      <div className="bg-[#0f2d1c] border-b border-[#1a4028] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#16a34a] flex items-center justify-center text-white text-sm font-bold">
            +
          </div>
          <div>
            <h1 className="text-white font-semibold text-base leading-tight">PuskesmasAI</h1>
            <p className="text-[#4ade80] text-xs">Form Triase Pasien</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs text-[#4ade80] bg-[#0f2d1c] border border-[#1a4028] px-2 py-1 rounded-full">
              ● Offline
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5">

        {/* Section: Data Pasien */}
        <Section label="Data Pasien" icon="👤">
          {/* Usia */}
          <Field label="Usia Pasien (tahun)" required error={errors.patient_age}>
            <input
              type="number"
              name="patient_age"
              value={form.patient_age}
              onChange={handleChange}
              min={0}
              max={120}
              placeholder="Contoh: 32"
              className={inputClass(!!errors.patient_age)}
            />
          </Field>

          {/* Jenis Kelamin */}
          <Field label="Jenis Kelamin" required error={errors.patient_sex}>
            <div className="grid grid-cols-2 gap-2">
              {(["laki-laki", "perempuan"] as const).map((sex) => (
                <button
                  key={sex}
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, patient_sex: sex, is_pregnant: false }));
                    if (errors.patient_sex) setErrors((p) => ({ ...p, patient_sex: undefined }));
                  }}
                  className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${
                    form.patient_sex === sex
                      ? "bg-[#16a34a] border-[#16a34a] text-white"
                      : "bg-[#0f2d1c] border-[#1a4028] text-[#86efac] hover:border-[#16a34a]"
                  }`}
                >
                  {sex === "laki-laki" ? "👨 Laki-laki" : "👩 Perempuan"}
                </button>
              ))}
            </div>
            {errors.patient_sex && (
              <p className="text-red-400 text-xs mt-1">{errors.patient_sex}</p>
            )}
          </Field>

          {/* Berat Badan (opsional) */}
          <Field label="Berat Badan (kg)" hint="Opsional — penting untuk anak">
            <input
              type="number"
              name="patient_weight"
              value={form.patient_weight}
              onChange={handleChange}
              min={1}
              max={300}
              placeholder="Contoh: 18"
              className={inputClass(false)}
            />
          </Field>

          {/* Ibu Hamil */}
          {showPregnant && (
            <label className="flex items-center gap-3 bg-[#0f2d1c] border border-[#1a4028] rounded-lg px-4 py-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_pregnant"
                checked={form.is_pregnant}
                onChange={handleChange}
                className="w-4 h-4 accent-[#16a34a]"
              />
              <span className="text-[#86efac] text-sm">🤰 Sedang hamil</span>
            </label>
          )}
        </Section>

        {/* Section: Keluhan & Gejala */}
        <Section label="Keluhan & Gejala" icon="🩺">
          {/* Shortcut buttons */}
          <div>
            <p className="text-[#4ade80] text-xs mb-2">Ketuk untuk tambah gejala cepat:</p>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_SHORTCUTS.map((s) => {
                const active = form.symptoms.toLowerCase().includes(s.toLowerCase());
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addShortcut(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      active
                        ? "bg-[#16a34a] border-[#16a34a] text-white"
                        : "bg-[#0f2d1c] border-[#1a4028] text-[#86efac] hover:border-[#16a34a]"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea gejala */}
          <Field
            label="Deskripsi Gejala"
            required
            error={errors.symptoms}
            hint="Tulis dalam Bahasa Indonesia. Contoh: demam 3 hari, bintik merah di kulit, mual"
          >
            <textarea
              name="symptoms"
              value={form.symptoms}
              onChange={handleChange}
              rows={4}
              placeholder="Contoh: demam tinggi 3 hari, muncul bintik merah di lengan, mual dan tidak nafsu makan..."
              className={`${inputClass(!!errors.symptoms)} resize-none`}
            />
          </Field>

          {/* Durasi */}
          <Field label="Sudah berapa hari sakit?" required error={errors.duration_days}>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, duration_days: d }));
                    if (errors.duration_days) setErrors((p) => ({ ...p, duration_days: undefined }));
                  }}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    Number(form.duration_days) === d
                      ? "bg-[#16a34a] border-[#16a34a] text-white"
                      : "bg-[#0f2d1c] border-[#1a4028] text-[#86efac] hover:border-[#16a34a]"
                  }`}
                >
                  {d === 7 ? "7+" : `${d}`}
                </button>
              ))}
            </div>
            <input
              type="number"
              name="duration_days"
              value={form.duration_days}
              onChange={handleChange}
              min={0}
              placeholder="Atau ketik jumlah hari..."
              className={`${inputClass(!!errors.duration_days)} mt-2`}
            />
          </Field>
        </Section>

        {/* Section: Tanda Vital */}
        <Section label="Tanda Vital" icon="🌡️">
          <Field label="Suhu Tubuh (°C)" hint="Opsional — isi jika ada termometer">
            <div className="relative">
              <input
                type="number"
                name="temperature"
                value={form.temperature}
                onChange={handleChange}
                min={34}
                max={43}
                step={0.1}
                placeholder="Contoh: 38.5"
                className={inputClass(false)}
              />
              {form.temperature !== "" && Number(form.temperature) >= 38 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-400 font-medium">
                  {Number(form.temperature) >= 39.5
                    ? "🔴 Sangat tinggi"
                    : Number(form.temperature) >= 38.5
                    ? "🟠 Tinggi"
                    : "🟡 Subfebris"}
                </span>
              )}
            </div>
          </Field>
        </Section>

        {/* Section: Catatan Tambahan */}
        <Section label="Catatan Tambahan" icon="📝">
          <Field hint="Riwayat penyakit, alergi obat, atau kondisi khusus lainnya">
            <textarea
              name="additional_notes"
              value={form.additional_notes}
              onChange={handleChange}
              rows={3}
              placeholder="Contoh: riwayat diabetes, alergi penisilin, sedang minum obat rutin..."
              className={`${inputClass(false)} resize-none`}
            />
          </Field>
        </Section>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-bold text-white text-base transition-all
            bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.98]
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 shadow-lg shadow-green-900/40"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Menganalisis...
            </>
          ) : (
            <>
              <span>🔍</span> Analisis Triase
            </>
          )}
        </button>

        <p className="text-center text-[#4ade80] text-xs pb-4">
          ⚠️ Alat bantu keputusan — bukan pengganti diagnosis dokter
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0f2d1c] border border-[#1a4028] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1a4028] flex items-center gap-2">
        <span>{icon}</span>
        <h2 className="text-[#4ade80] text-sm font-semibold tracking-wide uppercase">{label}</h2>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[#86efac] text-sm font-medium">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {hint && <p className="text-[#4ade80] text-xs opacity-70">{hint}</p>}
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full bg-[#0a1f14] border ${
    hasError ? "border-red-500" : "border-[#1a4028]"
  } rounded-lg px-3 py-2.5 text-white text-sm placeholder-[#2d5a3d]
  focus:outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-colors`;
}
