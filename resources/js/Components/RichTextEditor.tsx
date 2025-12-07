import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';

interface Props {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start writing...',
    maxLength = 5000,
    disabled = false
}: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                code: false,
                codeBlock: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const text = editor.getText();

            // Check character limit
            if (text.length <= maxLength) {
                onChange(html);
            }
        },
    });

    if (!editor) {
        return null;
    }

    const currentLength = editor.getText().length;

    return (
        <div className="rich-text-editor">
            {/* Toolbar */}
            <div className="editor-toolbar">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
                    disabled={disabled}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
                    disabled={disabled}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <div className="toolbar-divider" />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                    disabled={disabled}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                    disabled={disabled}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
                <div className="toolbar-divider" />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    className="toolbar-btn"
                    disabled={disabled || !editor.can().undo()}
                    title="Undo"
                >
                    <Undo size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    className="toolbar-btn"
                    disabled={disabled || !editor.can().redo()}
                    title="Redo"
                >
                    <Redo size={16} />
                </button>
                <div className="char-counter">
                    <span className={currentLength > maxLength ? 'over-limit' : ''}>
                        {currentLength}/{maxLength}
                    </span>
                </div>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} className="editor-content" />
        </div>
    );
}
