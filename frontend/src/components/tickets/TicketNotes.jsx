import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Send, Trash2, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getWorkspacePreferences } from '../../pages/SettingsPage.jsx';

export function TicketNotes({ ticketId }) {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = `resolvedesk_notes_${ticketId}`;


  useEffect(() => {
    if (!ticketId) return;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setNotes(JSON.parse(stored));
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Failed to read ticket notes', err);
      setNotes([]);
    }
  }, [ticketId, storageKey]);


  const saveNotes = (updated) => {
    setNotes(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save ticket notes', err);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    const prefs = getWorkspacePreferences();
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      author: prefs.teamName || 'Support Agent',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    setContent('');
    setIsSubmitting(false);
    toast.success('Internal note posted');
  };

  const handleDeleteNote = (noteId) => {
    const updated = notes.filter((n) => n.id !== noteId);
    saveNotes(updated);
    toast.success('Note removed');
  };

  return (
    <div className="rounded-xl border border-[#1F212D] bg-[#12131A] p-4.5 space-y-4">

      <div className="flex items-center justify-between pb-3 border-b border-[#1C1C28]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Internal Notes & Comments
          </h4>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#1A1C28] text-indigo-300 border border-indigo-500/20">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>


      <form onSubmit={handleAddNote} className="space-y-2.5">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Leave an internal note, triage update, or reproduction step..."
          className="w-full p-3 text-xs bg-[#0A0B10] border border-[#232536] rounded-lg text-white placeholder-[#5A5C70] focus:border-indigo-500 focus:outline-none transition-colors resize-none leading-relaxed"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              handleAddNote(e);
            }
          }}
        />

        <div className="flex items-center justify-between text-[11px] text-[#5A5C70]">
          <span>Press <kbd className="px-1 py-0.5 bg-[#171822] rounded border border-[#242636] text-[#8C90A8] font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-[#171822] rounded border border-[#242636] text-[#8C90A8] font-mono text-[10px]">Enter</kbd> to submit</span>
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          >
            <Send className="w-3 h-3" />
            <span>Post Note</span>
          </button>
        </div>
      </form>


      {notes.length === 0 ? (
        <div className="py-5 text-center border border-dashed border-[#1E202E] rounded-lg bg-[#0C0D14]/50">
          <p className="text-xs text-[#737385]">No internal notes recorded yet.</p>
          <p className="text-[11px] text-[#555566] mt-0.5">Use notes to coordinate ticket triage with other agents.</p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-lg bg-[#0E0F17] border border-[#1C1D2A] space-y-2 group transition-colors hover:border-[#282B3E]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                    {note.author ? note.author.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="text-xs font-semibold text-white">{note.author}</span>
                  <span className="text-[10px] text-[#5A5C70] font-mono">
                    {format(new Date(note.createdAt), 'MMM d, yyyy · h:mm a')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#6B6E85] hover:text-red-400 p-1 rounded transition-opacity"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-[#D1D3E0] leading-relaxed whitespace-pre-wrap pl-7">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
