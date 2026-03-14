"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2, CircleCheck } from "lucide-react";

const contactSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  whatsapp: z.string().min(1, "El WhatsApp es obligatorio"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Ingresá un email válido"),
  mensaje: z.string().min(1, "Contanos qué te gustaría automatizar"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const inputClasses =
    "w-full border border-border rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition";

  return (
    <section
      id="contacto"
      className="py-24 lg:py-32 px-6"
      style={{
        background:
          "linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #2A2A4E 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 gap-16 items-center">
        {/* Left column */}
        <div className="mb-12 lg:mb-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-inverse">
            Hablemos
          </h2>
          <p className="text-text-muted text-lg mt-6">
            Completa el formulario y agendamos una consulta gratuita de 30
            minutos. Sin compromiso. Sin vueltas.
          </p>

          <div className="space-y-4 mt-8">
            <div className="flex gap-3 items-start">
              <CircleCheck size={20} className="text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-text-inverse">
                Consulta 100% gratuita
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <CircleCheck size={20} className="text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-text-inverse">
                Te respondemos en menos de 24hs
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <CircleCheck size={20} className="text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-text-inverse">
                Sin compromiso de contratación
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle size={48} className="text-success" />
              <h3 className="text-2xl font-bold text-text mt-4">
                Recibimos tu mensaje
              </h3>
              <p className="text-text-secondary mt-2">
                Te respondemos en menos de 24 horas hábiles.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="nombre" className="text-sm font-medium text-text mb-1.5 block">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  autoComplete="name"
                  {...register("nombre")}
                  className={inputClasses}
                />
                {errors.nombre && (
                  <p className="text-error text-sm mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="whatsapp" className="text-sm font-medium text-text mb-1.5 block">
                  WhatsApp
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  autoComplete="tel"
                  {...register("whatsapp")}
                  placeholder="+54 11 1234-5678"
                  className={inputClasses}
                />
                {errors.whatsapp && (
                  <p className="text-error text-sm mt-1">
                    {errors.whatsapp.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-text mb-1.5 block">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className={inputClasses}
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="mensaje" className="text-sm font-medium text-text mb-1.5 block">
                  ¿Qué te gustaría automatizar?
                </label>
                <textarea
                  id="mensaje"
                  {...register("mensaje")}
                  rows={4}
                  className={`${inputClasses} resize-none`}
                />
                {errors.mensaje && (
                  <p className="text-error text-sm mt-1">
                    {errors.mensaje.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-lg text-text-inverse cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition"
                style={{
                  background:
                    "linear-gradient(135deg, #8B2F1C 0%, #6E2416 100%)",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Quiero mi consulta gratis"
                )}
              </button>

              <p className="text-xs text-text-muted mt-4 text-center">
                Te respondemos en menos de 24 horas hábiles.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
