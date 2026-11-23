import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertCircle, HelpCircle, ShieldAlert } from 'lucide-react';
import { createTicketSchema } from '../lib/validation.js';
import { useCreateTicket } from '../hooks/useTickets.js';
import { AppHeader } from '../components/layout/AppHeader.jsx';
import { getWorkspacePreferences } from './SettingsPage.jsx';

const CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Other'];
const PRIORITIES = [
  { value: 'Low', description: 'Minor non-blocking cosmetic or trivial request', color: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: 'Medium', description: 'Affecting workflow but a viable workaround exists', color: 'text-yellow-400', badge: 'bg-yellow-500/10 border-yellow-500/20' },
  { value: 'High', description: 'Major degradation or blocker for important work', color: 'text-orange-400', badge: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'Urgent', description: 'Outage, critical production failure, or blocker', color: 'text-red-400', badge: 'bg-red-500/10 border-red-500/30' },
];

function FormField({ label, error, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1 text-xs font-semibold text-[#A3A3A3]">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        {hint && !error && <span className="text-[11px] text-[#737373] font-mono">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { mutate: createTicket, isPending } = useCreateTicket();

  const prefs = getWorkspacePreferences();
  const defaultPriorityVal = prefs.defaultPriority || 'Medium';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: '',
      priority: defaultPriorityVal,
    },
  });

  useEffect(() => {
    setValue('priority', defaultPriorityVal);
  }, [defaultPriorityVal, setValue]);

  const subject = watch('subject') || '';
  const description = watch('description') || '';
  const selectedPriority = watch('priority');

  const onSubmit = (data) => {
    createTicket(data, {
      onSuccess: (ticket) => {
        toast.success('Ticket created successfully');
        navigate(`/tickets/${ticket._id}`);
      },
      onError: (err) => {
        toast.error(err?.message || 'Failed to create ticket');
      },
    });
  };

  const inputClass = (hasError) =>
    `w-full h-10 px-3.5 text-xs bg-[#0E0E0E] border ${
      hasError ? 'border-red-500/50' : 'border-[#242424]'
    } rounded-lg text-white placeholder-[#616161] focus:border-indigo-500 focus:outline-none transition-colors`;

  return (
    <div className="flex flex-col flex-1 bg-[#050505]">
      <AppHeader
        title="Create New Ticket"
        breadcrumbs={[
          { label: 'ResolveDesk' },
          { label: 'Tickets', to: '/tickets' },
          { label: 'New' },
        ]}
      />

      <div className="flex-1 p-7 max-w-5xl w-full mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 space-y-5 shadow-xs">
                <div className="pb-3 border-b border-[#1C1C1C]">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ticket Details</h2>
                  <p className="text-xs text-[#737373] mt-0.5">Please provide specific details to help support triage and resolve the issue quickly.</p>
                </div>


                <FormField
                  label="Subject"
                  required
                  error={errors.subject?.message}
                  hint={`${subject.length}/120`}
                >
                  <input
                    {...register('subject')}
                    type="text"
                    placeholder="Brief summary of the issue or request..."
                    maxLength={120}
                    className={inputClass(!!errors.subject)}
                  />
                </FormField>


                <FormField
                  label="Description"
                  required
                  error={errors.description?.message}
                  hint={`${description.length} chars`}
                >
                  <textarea
                    {...register('description')}
                    placeholder="Provide full context, reproduction steps, error logs, and impact on operations..."
                    rows={6}
                    className={`w-full p-3.5 text-xs bg-[#0E0E0E] border ${
                      errors.description ? 'border-red-500/50' : 'border-[#242424]'
                    } rounded-lg text-white placeholder-[#616161] focus:border-indigo-500 focus:outline-none transition-colors resize-none leading-relaxed`}
                  />
                </FormField>
              </div>


              <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-6 space-y-5 shadow-xs">
                <div className="pb-3 border-b border-[#1C1C1C]">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Classification</h2>
                  <p className="text-xs text-[#737373] mt-0.5">Categorize your ticket and designate priority level.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">

                  <FormField label="Category" required error={errors.category?.message}>
                    <div className="relative">
                      <select
                        {...register('category')}
                        className={`w-full h-10 pl-3.5 pr-8 text-xs bg-[#0E0E0E] border ${
                          errors.category ? 'border-red-500/50' : 'border-[#242424]'
                        } rounded-lg text-white appearance-none focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer`}
                      >
                        <option value="" className="bg-[#141414] text-[#737373]">Select category...</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#141414] text-white">{cat}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none text-[10px]">▾</span>
                    </div>
                  </FormField>


                  <FormField label="Priority" required error={errors.priority?.message}>
                    <div className="relative">
                      <select
                        {...register('priority')}
                        className={`w-full h-10 pl-3.5 pr-8 text-xs bg-[#0E0E0E] border ${
                          errors.priority ? 'border-red-500/50' : 'border-[#242424]'
                        } rounded-lg text-white appearance-none focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer`}
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p.value} value={p.value} className="bg-[#141414] text-white">{p.value}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none text-[10px]">▾</span>
                    </div>
                  </FormField>
                </div>
              </div>


              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/tickets')}
                  className="px-4 py-2 text-xs font-medium border border-[#262626] bg-[#141414] text-[#A3A3A3] rounded-lg hover:bg-[#1E1E1E] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_18px_rgba(99,102,241,0.35)] active:scale-95"
                >
                  {isPending ? 'Creating Ticket...' : 'Create Ticket'}
                </button>
              </div>
            </div>


            <div className="space-y-5">

              <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-[#1C1C1C]">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Priority Guidelines</h3>
                </div>
                <div className="space-y-2.5">
                  {PRIORITIES.map((p) => (
                    <div
                      key={p.value}
                      className={`p-3 rounded-lg border transition-all ${
                        selectedPriority === p.value
                          ? `${p.badge} border-opacity-60 shadow-sm`
                          : 'bg-[#0E0E0E] border-[#1C1C1C]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${p.color}`}>
                          {p.value}
                        </span>
                        {selectedPriority === p.value && (
                          <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8C8C8C] leading-relaxed">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>


              <div className="rounded-xl border border-[#1C1C1C] bg-[#111111] p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Triage SLA</h3>
                </div>
                <ul className="space-y-2">
                  {[
                    { label: 'Urgent', sla: '< 1 hour' },
                    { label: 'High', sla: '< 4 hours' },
                    { label: 'Medium', sla: '< 24 hours' },
                    { label: 'Low', sla: '< 48 hours' },
                  ].map((tier) => (
                    <li key={tier.label} className="flex items-center justify-between text-xs py-1 border-b border-[#1A1A1A] last:border-0">
                      <span className="text-[#A3A3A3]">{tier.label} response:</span>
                      <span className="font-mono font-bold text-white">{tier.sla}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
