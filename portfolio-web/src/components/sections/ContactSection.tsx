'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, Dribbble, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { SocialLinks } from '@/lib/types/profile';

interface ContactSectionProps {
  socialLinks: SocialLinks | null;
  email?: string | null;
}

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().max(200).optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface SocialIconDef {
  key: keyof SocialLinks;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const SOCIAL_ICONS: SocialIconDef[] = [
  { key: 'github', icon: <Github className="w-5 h-5" />, label: 'GitHub', color: 'hover:text-white hover:bg-zinc-800' },
  { key: 'linkedin', icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', color: 'hover:text-blue-400 hover:bg-blue-950/40' },
  { key: 'twitter', icon: <Twitter className="w-5 h-5" />, label: 'Twitter / X', color: 'hover:text-sky-400 hover:bg-sky-950/40' },
  { key: 'email', icon: <Mail className="w-5 h-5" />, label: 'Email', color: 'hover:text-indigo-400 hover:bg-indigo-950/40' },
  { key: 'dribbble', icon: <Dribbble className="w-5 h-5" />, label: 'Dribbble', color: 'hover:text-pink-400 hover:bg-pink-950/40' },
];

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactSection({ socialLinks, email }: ContactSectionProps) {
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setFormStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message ?? 'Failed to send message. Please try again.');
      }

      setFormStatus('success');
      reset();

      setTimeout(() => setFormStatus('idle'), 6000);
    } catch (err) {
      setFormStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 bg-[#1a1a1a] border text-white placeholder-zinc-500 rounded-xl text-sm focus:outline-none transition-all duration-200 ${
      hasError
        ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
        : 'border-[#27272a] focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30'
    }`;

  return (
    <section
      id="contact"
      className="py-24 bg-[#0d0d0d]"
      aria-label="Contact"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sm font-medium text-indigo-400 tracking-widest uppercase">
            Contact
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            Get In Touch
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Have a project in mind or just want to say hi? Send me a message and I&apos;ll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Social Links Column */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Let&apos;s connect</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                You can also reach me through these platforms:
              </p>
            </div>

            {/* Social Links */}
            {socialLinks && (
              <div className="flex flex-col gap-3">
                {SOCIAL_ICONS.map(({ key, icon, label, color }) => {
                  const href = socialLinks[key];
                  if (!href) return null;

                  const resolvedHref =
                    key === 'email' && !href.startsWith('mailto:')
                      ? `mailto:${href}`
                      : href;

                  return (
                    <a
                      key={key}
                      href={resolvedHref}
                      target={key === 'email' ? undefined : '_blank'}
                      rel={key === 'email' ? undefined : 'noopener noreferrer'}
                      aria-label={label}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141414] border border-[#27272a] text-zinc-400 transition-all duration-200 ${color} hover:border-zinc-700 hover:scale-[1.02]`}
                    >
                      {icon}
                      <span className="text-sm font-medium">{label}</span>
                    </a>
                  );
                })}
              </div>
            )}

            {/* Direct email if no social */}
            {!socialLinks && email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#141414] border border-[#27272a] text-zinc-400 hover:text-indigo-400 hover:bg-indigo-950/40 transition-all duration-200"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-medium">{email}</span>
              </a>
            )}
          </motion.div>

          {/* Contact Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-col gap-5 bg-[#141414] border border-[#27272a] rounded-2xl p-6 sm:p-8"
              aria-label="Contact form"
            >
              {/* Name & Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-sm font-medium text-zinc-300">
                    Name <span className="text-red-400" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    {...register('name')}
                    className={inputClass(!!errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p id="contact-name-error" className="text-xs text-red-400" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-sm font-medium text-zinc-300">
                    Email <span className="text-red-400" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...register('email')}
                    className={inputClass(!!errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p id="contact-email-error" className="text-xs text-red-400" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-subject" className="text-sm font-medium text-zinc-300">
                  Subject{' '}
                  <span className="text-zinc-600 font-normal text-xs">(optional)</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  placeholder="What is this about?"
                  {...register('subject')}
                  className={inputClass(!!errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  aria-invalid={!!errors.subject}
                />
                {errors.subject && (
                  <p id="contact-subject-error" className="text-xs text-red-400" role="alert">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium text-zinc-300">
                  Message <span className="text-red-400" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  placeholder="Tell me about your project or idea..."
                  rows={5}
                  {...register('message')}
                  className={`${inputClass(!!errors.message)} resize-none`}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p id="contact-message-error" className="text-xs text-red-400" role="alert">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Success/Error Feedback */}
              {formStatus === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2.5 px-4 py-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-xl text-sm"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  Message sent successfully! I&apos;ll get back to you soon.
                </div>
              )}

              {formStatus === 'error' && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-center gap-2.5 px-4 py-3 bg-red-950/40 border border-red-800/50 text-red-400 rounded-xl text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {errorMessage || 'Something went wrong. Please try again.'}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || formStatus === 'loading'}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-900/40 disabled:scale-100 disabled:shadow-none group"
                aria-busy={isSubmitting || formStatus === 'loading'}
              >
                {isSubmitting || formStatus === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
